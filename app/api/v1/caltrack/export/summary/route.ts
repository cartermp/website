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
    const format = searchParams.get('format') || 'json'

    try {
        // Build date filter conditions
        let dateCondition = ''
        let dateParams: string[] = []
        
        if (startDate && endDate) {
            dateCondition = 'WHERE date BETWEEN $1::date AND $2::date'
            dateParams = [startDate, endDate]
        } else if (startDate) {
            dateCondition = 'WHERE date >= $1::date'
            dateParams = [startDate]
        } else {
            dateCondition = 'WHERE date >= CURRENT_DATE - INTERVAL \'6 months\''
        }

        // Overall statistics
        const overallStats = await sql(`
            SELECT 
                COUNT(DISTINCT date) as total_days,
                ROUND(AVG(daily_total)::numeric, 2) as avg_daily_calories,
                MAX(daily_total) as max_daily_calories,
                MIN(daily_total) as min_daily_calories,
                ROUND(STDDEV(daily_total)::numeric, 2) as stddev_daily_calories
            FROM (
                SELECT 
                    date,
                    SUM(calories) as daily_total
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_totals
        `, dateParams)

        // Meal type breakdown
        const mealTypeStats = await sql(`
            SELECT 
                meal_type,
                COUNT(*) as entry_count,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                SUM(calories) as total_calories,
                MAX(calories) as max_calories,
                MIN(calories) as min_calories
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_type
            ORDER BY total_calories DESC
        `, dateParams)

        // Most frequent foods
        const topFoods = await sql(`
            SELECT 
                meal_name,
                COUNT(*) as frequency,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                SUM(calories) as total_calories
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            ORDER BY frequency DESC
            LIMIT 20
        `, dateParams)

        // Weekly averages (last 12 weeks)
        const weeklyTrends = await sql(`
            SELECT 
                DATE_TRUNC('week', date) as week_start,
                ROUND(AVG(daily_total)::numeric, 2) as avg_weekly_calories,
                COUNT(*) as days_in_week
            FROM (
                SELECT 
                    date,
                    SUM(calories) as daily_total
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_totals
            GROUP BY DATE_TRUNC('week', date)
            ORDER BY week_start DESC
            LIMIT 12
        `, dateParams)

        // Monthly breakdown
        const monthlyStats = await sql(`
            SELECT 
                DATE_TRUNC('month', date) as month,
                ROUND(AVG(daily_total)::numeric, 2) as avg_monthly_calories,
                COUNT(DISTINCT date) as days_with_entries,
                SUM(daily_total) as total_monthly_calories
            FROM (
                SELECT 
                    date,
                    SUM(calories) as daily_total
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_totals
            GROUP BY DATE_TRUNC('month', date)
            ORDER BY month DESC
            LIMIT 12
        `, dateParams)

        interface OverallStats {
            total_days: number;
            avg_daily_calories: number;
            max_daily_calories: number;
            min_daily_calories: number;
            stddev_daily_calories: number;
        }

        interface MealTypeStat {
            meal_type: string;
            entry_count: number;
            avg_calories: number;
            total_calories: number;
            max_calories: number;
            min_calories: number;
        }

        interface TopFood {
            meal_name: string;
            frequency: number;
            avg_calories: number;
            total_calories: number;
        }

        interface WeeklyTrend {
            week_start: string;
            avg_weekly_calories: number;
            days_in_week: number;
        }

        interface MonthlyBreakdown {
            month: string;
            avg_monthly_calories: number;
            days_with_entries: number;
            total_monthly_calories: number;
        }

        interface Summary {
            overall: OverallStats;
            meal_types: MealTypeStat[];
            top_foods: TopFood[];
            weekly_trends: WeeklyTrend[];
            monthly_breakdown: MonthlyBreakdown[];
        }

        const summary: Summary = {
            overall: {
                total_days: overallStats[0]?.total_days || 0,
                avg_daily_calories: overallStats[0]?.avg_daily_calories || 0,
                max_daily_calories: overallStats[0]?.max_daily_calories || 0,
                min_daily_calories: overallStats[0]?.min_daily_calories || 0,
                stddev_daily_calories: overallStats[0]?.stddev_daily_calories || 0
            },
            meal_types: mealTypeStats.map((row: any): MealTypeStat => ({
                meal_type: row.meal_type,
                entry_count: row.entry_count,
                avg_calories: row.avg_calories,
                total_calories: row.total_calories,
                max_calories: row.max_calories,
                min_calories: row.min_calories
            })),
            top_foods: topFoods.map((row: any): TopFood => ({
                meal_name: row.meal_name,
                frequency: row.frequency,
                avg_calories: row.avg_calories,
                total_calories: row.total_calories
            })),
            weekly_trends: weeklyTrends.map((row: any): WeeklyTrend => ({
                week_start: row.week_start,
                avg_weekly_calories: row.avg_weekly_calories,
                days_in_week: row.days_in_week
            })),
            monthly_breakdown: monthlyStats.map((row: any): MonthlyBreakdown => ({
                month: row.month,
                avg_monthly_calories: row.avg_monthly_calories,
                days_with_entries: row.days_with_entries,
                total_monthly_calories: row.total_monthly_calories
            }))
        }

        if (format === 'csv') {
            // For CSV, flatten the summary into multiple sections
            let csvContent = 'Section,Metric,Value\n'
            
            // Overall stats
            csvContent += `Overall,Total Days,${summary.overall.total_days}\n`
            csvContent += `Overall,Avg Daily Calories,${summary.overall.avg_daily_calories}\n`
            csvContent += `Overall,Max Daily Calories,${summary.overall.max_daily_calories}\n`
            csvContent += `Overall,Min Daily Calories,${summary.overall.min_daily_calories}\n`
            csvContent += `Overall,Std Dev,${summary.overall.stddev_daily_calories}\n`
            
            // Meal types
            summary.meal_types.forEach(meal => {
                csvContent += `Meal Types,${meal.meal_type} - Entry Count,${meal.entry_count}\n`
                csvContent += `Meal Types,${meal.meal_type} - Avg Calories,${meal.avg_calories}\n`
                csvContent += `Meal Types,${meal.meal_type} - Total Calories,${meal.total_calories}\n`
            })
            
            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="caltrack-summary.csv"'
                }
            })
        }

        return NextResponse.json({
            summary,
            meta: {
                start_date: startDate,
                end_date: endDate,
                format,
                generated_at: new Date().toISOString()
            }
        })

    } catch (error) {
        console.error('Export summary error:', error)
        return NextResponse.json(
            { error: 'Failed to generate summary' }, 
            { status: 500 }
        )
    }
}