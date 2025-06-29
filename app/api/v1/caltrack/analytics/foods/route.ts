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
    const mealType = searchParams.get('meal_type')
    const limit = parseInt(searchParams.get('limit') || '50')
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

        // Add meal type filter if provided
        if (mealType) {
            dateCondition += dateParams.length > 0 ? ' AND meal_type = $' + (dateParams.length + 1) : 'WHERE meal_type = $1'
            dateParams.push(mealType)
        }

        // Most frequently consumed foods
        const topFoodsByFrequency = await sql(`
            SELECT 
                meal_name,
                COUNT(*) as frequency,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                MIN(calories) as min_calories,
                MAX(calories) as max_calories,
                SUM(calories) as total_calories,
                COUNT(DISTINCT date) as days_consumed,
                ARRAY_AGG(DISTINCT meal_type) as meal_types
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            ORDER BY frequency DESC
            LIMIT ${limit}
        `, dateParams)

        // Highest calorie foods
        const topFoodsByCalories = await sql(`
            SELECT 
                meal_name,
                MAX(calories) as max_calories,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                COUNT(*) as frequency,
                SUM(calories) as total_calories,
                COUNT(DISTINCT date) as days_consumed,
                ARRAY_AGG(DISTINCT meal_type) as meal_types
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            ORDER BY max_calories DESC
            LIMIT ${limit}
        `, dateParams)

        // Most total calories contributed
        const topFoodsByTotalCalories = await sql(`
            SELECT 
                meal_name,
                SUM(calories) as total_calories,
                COUNT(*) as frequency,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                MIN(calories) as min_calories,
                MAX(calories) as max_calories,
                COUNT(DISTINCT date) as days_consumed,
                ARRAY_AGG(DISTINCT meal_type) as meal_types
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            ORDER BY total_calories DESC
            LIMIT ${limit}
        `, dateParams)

        // Food diversity analysis
        const foodDiversity = await sql(`
            SELECT 
                COUNT(DISTINCT meal_name) as unique_foods,
                COUNT(*) as total_entries,
                ROUND((COUNT(DISTINCT meal_name) * 100.0 / COUNT(*))::numeric, 2) as diversity_ratio
            FROM calorie_entries
            ${dateCondition}
        `, dateParams)

        // Foods by meal type breakdown
        const foodsByMealType = await sql(`
            SELECT 
                meal_type,
                COUNT(DISTINCT meal_name) as unique_foods,
                COUNT(*) as total_entries,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                SUM(calories) as total_calories
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_type
            ORDER BY total_calories DESC
        `, dateParams)

        // Calorie efficiency analysis (foods with best calorie-to-frequency ratio)
        const calorieEfficiencyAnalysis = await sql(`
            SELECT 
                meal_name,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                COUNT(*) as frequency,
                ROUND((SUM(calories) / COUNT(*))::numeric, 2) as efficiency_score,
                COUNT(DISTINCT date) as days_consumed,
                ARRAY_AGG(DISTINCT meal_type) as meal_types
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            HAVING COUNT(*) >= 3  -- Only include foods eaten at least 3 times
            ORDER BY efficiency_score DESC
            LIMIT ${limit}
        `, dateParams)

        // Recent food trends (foods added in last 30 days)
        const recentFoodTrends = await sql(`
            SELECT 
                meal_name,
                MIN(date) as first_consumed,
                MAX(date) as last_consumed,
                COUNT(*) as frequency,
                ROUND(AVG(calories)::numeric, 2) as avg_calories,
                ARRAY_AGG(DISTINCT meal_type) as meal_types
            FROM calorie_entries
            ${dateCondition}
            GROUP BY meal_name
            HAVING MIN(date) >= CURRENT_DATE - INTERVAL '30 days'
            ORDER BY first_consumed DESC
            LIMIT 20
        `, dateParams)

        interface FoodFrequency {
            meal_name: string;
            frequency: number;
            avg_calories: number;
            min_calories: number;
            max_calories: number;
            total_calories: number;
            days_consumed: number;
            meal_types: string[];
        }

        interface FoodCalories {
            meal_name: string;
            max_calories: number;
            avg_calories: number;
            frequency: number;
            total_calories: number;
            days_consumed: number;
            meal_types: string[];
        }

        interface FoodTotalCalories {
            meal_name: string;
            total_calories: number;
            frequency: number;
            avg_calories: number;
            min_calories: number;
            max_calories: number;
            days_consumed: number;
            meal_types: string[];
        }

        interface FoodDiversity {
            unique_foods: number;
            total_entries: number;
            diversity_ratio: number;
        }

        interface FoodsByMealType {
            meal_type: string;
            unique_foods: number;
            total_entries: number;
            avg_calories: number;
            total_calories: number;
        }

        interface CalorieEfficiency {
            meal_name: string;
            avg_calories: number;
            frequency: number;
            efficiency_score: number;
            days_consumed: number;
            meal_types: string[];
        }

        interface RecentFood {
            meal_name: string;
            first_consumed: string;
            last_consumed: string;
            frequency: number;
            avg_calories: number;
            meal_types: string[];
        }

        interface FoodAnalytics {
            top_foods_by_frequency: FoodFrequency[];
            top_foods_by_calories: FoodCalories[];
            top_foods_by_total_calories: FoodTotalCalories[];
            food_diversity: FoodDiversity;
            foods_by_meal_type: FoodsByMealType[];
            calorie_efficiency: CalorieEfficiency[];
            recent_foods: RecentFood[];
        }

        const foodAnalytics: FoodAnalytics = {
            top_foods_by_frequency: topFoodsByFrequency.map((row: any): FoodFrequency => ({
                meal_name: row.meal_name,
                frequency: Number(row.frequency),
                avg_calories: Number(row.avg_calories),
                min_calories: Number(row.min_calories),
                max_calories: Number(row.max_calories),
                total_calories: Number(row.total_calories),
                days_consumed: Number(row.days_consumed),
                meal_types: row.meal_types
            })),
            top_foods_by_calories: topFoodsByCalories.map((row: any): FoodCalories => ({
                meal_name: row.meal_name,
                max_calories: Number(row.max_calories),
                avg_calories: Number(row.avg_calories),
                frequency: Number(row.frequency),
                total_calories: Number(row.total_calories),
                days_consumed: Number(row.days_consumed),
                meal_types: row.meal_types
            })),
            top_foods_by_total_calories: topFoodsByTotalCalories.map((row: any): FoodTotalCalories => ({
                meal_name: row.meal_name,
                total_calories: Number(row.total_calories),
                frequency: Number(row.frequency),
                avg_calories: Number(row.avg_calories),
                min_calories: Number(row.min_calories),
                max_calories: Number(row.max_calories),
                days_consumed: Number(row.days_consumed),
                meal_types: row.meal_types
            })),
            food_diversity: {
                unique_foods: Number(foodDiversity[0]?.unique_foods || 0),
                total_entries: Number(foodDiversity[0]?.total_entries || 0),
                diversity_ratio: Number(foodDiversity[0]?.diversity_ratio || 0)
            },
            foods_by_meal_type: foodsByMealType.map((row: any): FoodsByMealType => ({
                meal_type: row.meal_type,
                unique_foods: Number(row.unique_foods),
                total_entries: Number(row.total_entries),
                avg_calories: Number(row.avg_calories),
                total_calories: Number(row.total_calories)
            })),
            calorie_efficiency: calorieEfficiencyAnalysis.map((row: any): CalorieEfficiency => ({
                meal_name: row.meal_name,
                avg_calories: Number(row.avg_calories),
                frequency: Number(row.frequency),
                efficiency_score: Number(row.efficiency_score),
                days_consumed: Number(row.days_consumed),
                meal_types: row.meal_types
            })),
            recent_foods: recentFoodTrends.map((row: any): RecentFood => ({
                meal_name: row.meal_name,
                first_consumed: row.first_consumed,
                last_consumed: row.last_consumed,
                frequency: Number(row.frequency),
                avg_calories: Number(row.avg_calories),
                meal_types: row.meal_types
            }))
        }

        if (format === 'csv') {
            let csvContent = 'Category,Food Name,Frequency,Avg Calories,Total Calories,Days Consumed,Meal Types\n'
            
            foodAnalytics.top_foods_by_frequency.forEach(food => {
                csvContent += `Top by Frequency,${food.meal_name},${food.frequency},${food.avg_calories},${food.total_calories},${food.days_consumed},"${food.meal_types.join(', ')}"\n`
            })
            
            return new Response(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="caltrack-food-analytics.csv"'
                }
            })
        }

        return NextResponse.json({
            food_analytics: foodAnalytics,
            meta: {
                start_date: startDate,
                end_date: endDate,
                meal_type_filter: mealType,
                limit,
                format
            }
        })

    } catch (error) {
        console.error('Food analytics error:', error)
        return NextResponse.json(
            { error: 'Failed to analyze food data' }, 
            { status: 500 }
        )
    }
}