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
        let dateCondition = ''
        let dateParams: string[] = []
        
        if (startDate && endDate) {
            dateCondition = 'WHERE date BETWEEN $1::date AND $2::date'
            dateParams = [startDate, endDate]
        } else if (startDate) {
            dateCondition = 'WHERE date >= $1::date'
            dateParams = [startDate]
        } else {
            dateCondition = 'WHERE date >= CURRENT_DATE - INTERVAL \'3 months\''
        }

        // Day of week patterns
        const dayOfWeekPatterns = await sql(`
            SELECT 
                EXTRACT(DOW FROM date) as day_of_week,
                CASE EXTRACT(DOW FROM date)
                    WHEN 0 THEN 'Sunday'
                    WHEN 1 THEN 'Monday'
                    WHEN 2 THEN 'Tuesday'
                    WHEN 3 THEN 'Wednesday'
                    WHEN 4 THEN 'Thursday'
                    WHEN 5 THEN 'Friday'
                    WHEN 6 THEN 'Saturday'
                END as day_name,
                COUNT(DISTINCT date) as total_days,
                ROUND(AVG(daily_total)::numeric, 2) as avg_daily_calories,
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
            GROUP BY EXTRACT(DOW FROM date)
            ORDER BY day_of_week
        `, dateParams)

        // Meal timing patterns (which meals are most common)
        const mealTimingPatterns = await sql(`
            SELECT 
                meal_type,
                COUNT(*) as total_entries,
                ROUND(AVG(calories)::numeric, 2) as avg_calories_per_entry,
                COUNT(DISTINCT date) as days_with_meal,
                ROUND((COUNT(DISTINCT date) * 100.0 / (SELECT COUNT(DISTINCT date) FROM calorie_entries ${dateCondition}))::numeric, 2) as meal_frequency_percentage
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_type
            ORDER BY total_entries DESC
        `, dateParams)

        // Calorie distribution patterns
        const calorieDistribution = await sql(`
            SELECT 
                CASE 
                    WHEN daily_total < 1200 THEN 'Very Low (<1200)'
                    WHEN daily_total < 1800 THEN 'Low (1200-1799)'
                    WHEN daily_total < 2200 THEN 'Moderate (1800-2199)'
                    WHEN daily_total < 2800 THEN 'High (2200-2799)'
                    ELSE 'Very High (2800+)'
                END as calorie_range,
                COUNT(*) as days_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM (SELECT date, SUM(calories) as daily_total FROM calorie_entries ${dateCondition} GROUP BY date) sub))::numeric, 2) as percentage
            FROM (
                SELECT 
                    date,
                    SUM(calories) as daily_total
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_totals
            GROUP BY 
                CASE 
                    WHEN daily_total < 1200 THEN 'Very Low (<1200)'
                    WHEN daily_total < 1800 THEN 'Low (1200-1799)'
                    WHEN daily_total < 2200 THEN 'Moderate (1800-2199)'
                    WHEN daily_total < 2800 THEN 'High (2200-2799)'
                    ELSE 'Very High (2800+)'
                END
            ORDER BY MIN(daily_total)
        `, dateParams)

        // Eating consistency patterns (days with all meals vs partial days)
        const eatingConsistency = await sql(`
            SELECT 
                meals_per_day,
                COUNT(*) as days_count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(DISTINCT date) FROM calorie_entries ${dateCondition}))::numeric, 2) as percentage,
                ROUND(AVG(daily_total)::numeric, 2) as avg_calories_on_these_days
            FROM (
                SELECT 
                    date,
                    COUNT(DISTINCT meal_type) as meals_per_day,
                    SUM(calories) as daily_total
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_meal_counts
            GROUP BY meals_per_day
            ORDER BY meals_per_day
        `, dateParams)

        // Weekend vs weekday patterns
        const weekendVsWeekday = await sql(`
            SELECT 
                CASE 
                    WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 'Weekend'
                    ELSE 'Weekday'
                END as day_type,
                COUNT(DISTINCT date) as total_days,
                ROUND(AVG(daily_total)::numeric, 2) as avg_daily_calories,
                ROUND(AVG(breakfast_total)::numeric, 2) as avg_breakfast,
                ROUND(AVG(lunch_total)::numeric, 2) as avg_lunch,
                ROUND(AVG(dinner_total)::numeric, 2) as avg_dinner,
                ROUND(AVG(snacks_total)::numeric, 2) as avg_snacks,
                ROUND(AVG(meals_per_day)::numeric, 2) as avg_meals_per_day
            FROM (
                SELECT 
                    date,
                    SUM(calories) as daily_total,
                    SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as breakfast_total,
                    SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as lunch_total,
                    SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as dinner_total,
                    SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as snacks_total,
                    COUNT(DISTINCT meal_type) as meals_per_day
                FROM calorie_entries
                ${dateCondition}
                GROUP BY date
            ) daily_breakdown
            GROUP BY 
                CASE 
                    WHEN EXTRACT(DOW FROM date) IN (0, 6) THEN 'Weekend'
                    ELSE 'Weekday'
                END
            ORDER BY day_type
        `, dateParams)

        const patterns = {
            day_of_week: dayOfWeekPatterns.map(row => ({
                day_of_week: Number(row.day_of_week),
                day_name: row.day_name,
                total_days: Number(row.total_days),
                avg_daily_calories: Number(row.avg_daily_calories),
                meal_breakdown: {
                    breakfast: Number(row.avg_breakfast),
                    lunch: Number(row.avg_lunch),
                    dinner: Number(row.avg_dinner),
                    snacks: Number(row.avg_snacks)
                }
            })),
            meal_timing: mealTimingPatterns.map(row => ({
                meal_type: row.meal_type,
                total_entries: Number(row.total_entries),
                avg_calories_per_entry: Number(row.avg_calories_per_entry),
                days_with_meal: Number(row.days_with_meal),
                frequency_percentage: Number(row.meal_frequency_percentage)
            })),
            calorie_distribution: calorieDistribution.map(row => ({
                calorie_range: row.calorie_range,
                days_count: Number(row.days_count),
                percentage: Number(row.percentage)
            })),
            eating_consistency: eatingConsistency.map(row => ({
                meals_per_day: Number(row.meals_per_day),
                days_count: Number(row.days_count),
                percentage: Number(row.percentage),
                avg_calories: Number(row.avg_calories_on_these_days)
            })),
            weekend_vs_weekday: weekendVsWeekday.map(row => ({
                day_type: row.day_type,
                total_days: Number(row.total_days),
                avg_daily_calories: Number(row.avg_daily_calories),
                avg_meals_per_day: Number(row.avg_meals_per_day),
                meal_breakdown: {
                    breakfast: Number(row.avg_breakfast),
                    lunch: Number(row.avg_lunch),
                    dinner: Number(row.avg_dinner),
                    snacks: Number(row.avg_snacks)
                }
            }))
        }

        if (format === 'csv') {
            let csvContent = 'Pattern Type,Metric,Value,Additional Info\n'
            
            // Day of week patterns
            patterns.day_of_week.forEach(day => {
                csvContent += `Day of Week,${day.day_name} Avg Calories,${day.avg_daily_calories},${day.total_days} days\n`
            })
            
            // Meal timing patterns
            patterns.meal_timing.forEach(meal => {
                csvContent += `Meal Timing,${meal.meal_type} Frequency,${meal.frequency_percentage}%,${meal.total_entries} entries\n`
            })
            
            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="caltrack-patterns.csv"'
                }
            })
        }

        return NextResponse.json({
            patterns,
            meta: {
                start_date: startDate,
                end_date: endDate,
                format,
                analysis_period: dateCondition.includes('3 months') ? '3 months' : 'custom'
            }
        })

    } catch (error) {
        console.error('Analytics patterns error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze patterns' }, 
            { status: 500 }
        )
    }
}