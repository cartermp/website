import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"

export async function GET() {
    // Get the last 6 months of entries for overall stats
    const entries = await sql`
        SELECT date, meal_type, meal_name, calories 
        FROM calorie_entries 
        WHERE date >= CURRENT_DATE - INTERVAL '6 months'
        ORDER BY date DESC, meal_type`;

    // Get the overall average calories per day (excluding days marked as excluded)
    const overallStats = await sql`
        SELECT 
            ROUND(AVG(daily_total)::numeric, 0) as overall_average
        FROM (
            SELECT 
                ce.date,
                SUM(ce.calories) as daily_total
            FROM calorie_entries ce
            LEFT JOIN daily_stats ds ON ce.date = ds.date
            WHERE COALESCE(ds.is_excluded, false) = false
            GROUP BY ce.date
        ) daily_totals`;

    // Get today's summary stats
    const todayStats = await sql`
        SELECT 
            date,
            total_calories,
            breakfast_calories,
            lunch_calories,
            dinner_calories,
            snacks_calories,
            is_excluded
        FROM daily_stats
        WHERE date = CURRENT_DATE`;

    return NextResponse.json({
        entries,
        stats: todayStats[0] || null,
        overallAverage: overallStats[0].overall_average
    });
}