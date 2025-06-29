import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { validateApiAuth, createAuthError } from "@/lib/auth";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const auth = await validateApiAuth(request)
    if (!auth.authenticated) {
        return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const interval = searchParams.get('interval') || 'daily' // daily, weekly, monthly
    const format = searchParams.get('format') || 'json'

    try {
        let dateCondition = ''
        let dateParams: string[] = []

        if (startDate && endDate) {
            dateCondition = 'WHERE date BETWEEN $1::date AND $2::date'
            dateParams = [startDate, endDate]
        } else if (startDate) {
            dateCondition = 'WHERE date >= $1::date'
            dateParams = [startDate]
        } else {
            // Default to last 3 months for trends
            dateCondition = 'WHERE date >= CURRENT_DATE - INTERVAL \'3 months\''
        }

        let trendsQuery = ''
        let trendsData = []

        switch (interval) {
            case 'weekly':
                trendsQuery = `
                    SELECT 
                        DATE_TRUNC('week', date) as period,
                        'week' as interval_type,
                        ROUND(AVG(daily_total)::numeric, 2) as avg_calories,
                        MAX(daily_total) as max_calories,
                        MIN(daily_total) as min_calories,
                        COUNT(*) as days_count,
                        ROUND(AVG(breakfast_total)::numeric, 2) as avg_breakfast,
                        ROUND(AVG(lunch_total)::numeric, 2) as avg_lunch,
                        ROUND(AVG(dinner_total)::numeric, 2) as avg_dinner,
                        ROUND(AVG(snacks_total)::numeric, 2) as avg_snacks
                    FROM (
                        SELECT 
                            date,
                            SUM(calories) as daily_total,
                            SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as breakfast_total,
                            SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as lunch_total,
                            SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as dinner_total,
                            SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as snacks_total
                        FROM calorie_entries
                        ${dateCondition}
                        GROUP BY date
                    ) daily_breakdown
                    GROUP BY DATE_TRUNC('week', date)
                    ORDER BY period DESC
                `
                break;

            case 'monthly':
                trendsQuery = `
                    SELECT 
                        DATE_TRUNC('month', date) as period,
                        'month' as interval_type,
                        ROUND(AVG(daily_total)::numeric, 2) as avg_calories,
                        MAX(daily_total) as max_calories,
                        MIN(daily_total) as min_calories,
                        COUNT(*) as days_count,
                        ROUND(AVG(breakfast_total)::numeric, 2) as avg_breakfast,
                        ROUND(AVG(lunch_total)::numeric, 2) as avg_lunch,
                        ROUND(AVG(dinner_total)::numeric, 2) as avg_dinner,
                        ROUND(AVG(snacks_total)::numeric, 2) as avg_snacks
                    FROM (
                        SELECT 
                            date,
                            SUM(calories) as daily_total,
                            SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as breakfast_total,
                            SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as lunch_total,
                            SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as dinner_total,
                            SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as snacks_total
                        FROM calorie_entries
                        ${dateCondition}
                        GROUP BY date
                    ) daily_breakdown
                    GROUP BY DATE_TRUNC('month', date)
                    ORDER BY period DESC
                `
                break;

            default: // daily
                trendsQuery = `
                    SELECT 
                        date as period,
                        'day' as interval_type,
                        SUM(calories) as avg_calories,
                        SUM(calories) as max_calories,
                        SUM(calories) as min_calories,
                        1 as days_count,
                        SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as avg_breakfast,
                        SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as avg_lunch,
                        SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as avg_dinner,
                        SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as avg_snacks
                    FROM calorie_entries
                    ${dateCondition}
                    GROUP BY date
                    ORDER BY date DESC
                `
        }

        trendsData = await sql(trendsQuery, dateParams)

        // Calculate moving averages (7-day for daily, 4-period for weekly/monthly)
        const movingAvgPeriod = interval === 'daily' ? 7 : 4
        const trendsWithMovingAvg = trendsData.map((trend, index) => {
            const lookbackData = trendsData.slice(index, index + movingAvgPeriod)
            const movingAvg = lookbackData.length > 0 ? 
                Math.round(lookbackData.reduce((sum, item) => sum + Number(item.avg_calories), 0) / lookbackData.length * 100) / 100 : null

            return {
                period: trend.period,
                interval_type: trend.interval_type,
                avg_calories: Number(trend.avg_calories),
                max_calories: Number(trend.max_calories),
                min_calories: Number(trend.min_calories),
                days_count: Number(trend.days_count),
                moving_average: movingAvg,
                meal_breakdown: {
                    breakfast: Number(trend.avg_breakfast),
                    lunch: Number(trend.avg_lunch),
                    dinner: Number(trend.avg_dinner),
                    snacks: Number(trend.avg_snacks)
                }
            }
        })

        // Calculate trend direction (simple linear regression slope)
        if (trendsWithMovingAvg.length >= 2) {
            const n = trendsWithMovingAvg.length
            const xSum = trendsWithMovingAvg.reduce((sum, _, i) => sum + i, 0)
            const ySum = trendsWithMovingAvg.reduce((sum, trend) => sum + trend.avg_calories, 0)
            const xySum = trendsWithMovingAvg.reduce((sum, trend, i) => sum + i * trend.avg_calories, 0)
            const x2Sum = trendsWithMovingAvg.reduce((sum, _, i) => sum + i * i, 0)

            const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum)
            const trendDirection = slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable'

            if (format === 'csv') {
                const csvHeaders = 'period,interval_type,avg_calories,max_calories,min_calories,days_count,moving_average,breakfast,lunch,dinner,snacks\n'
                const csvRows = trendsWithMovingAvg.map(trend => 
                    `${trend.period},${trend.interval_type},${trend.avg_calories},${trend.max_calories},${trend.min_calories},${trend.days_count},${trend.moving_average || ''},${trend.meal_breakdown.breakfast},${trend.meal_breakdown.lunch},${trend.meal_breakdown.dinner},${trend.meal_breakdown.snacks}`
                ).join('\n')
                
                return new Response(csvHeaders + csvRows, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': 'attachment; filename="caltrack-trends.csv"'
                    }
                })
            }

            return NextResponse.json({
                trends: trendsWithMovingAvg,
                trend_analysis: {
                    direction: trendDirection,
                    slope: Math.round(slope * 100) / 100,
                    total_periods: n
                },
                meta: {
                    interval,
                    start_date: startDate,
                    end_date: endDate,
                    format,
                    moving_average_periods: movingAvgPeriod
                }
            })
        }

        return NextResponse.json({
            trends: trendsWithMovingAvg,
            trend_analysis: {
                direction: 'insufficient_data',
                slope: 0,
                total_periods: trendsWithMovingAvg.length
            },
            meta: {
                interval,
                start_date: startDate,
                end_date: endDate,
                format,
                moving_average_periods: movingAvgPeriod
            }
        })

    } catch (error) {
        console.error('Analytics trends error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze trends' }, 
            { status: 500 }
        )
    }
}