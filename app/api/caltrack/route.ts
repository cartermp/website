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

    // Get the overall average calories per day
    const overallStats = await sql`
        SELECT 
            ROUND(AVG(daily_total)::numeric, 0) as overall_average
        FROM (
            SELECT 
                date,
                SUM(calories) as daily_total
            FROM calorie_entries
            GROUP BY date
        ) daily_totals`;

    // Get today's summary stats
    const todayStats = await sql`
        SELECT 
            date,
            total_calories,
            breakfast_calories,
            lunch_calories,
            dinner_calories,
            snacks_calories
        FROM daily_stats
        WHERE date = CURRENT_DATE`;

    return NextResponse.json({
        entries,
        stats: todayStats[0] || null,
        overallAverage: overallStats[0].overall_average
    });
}