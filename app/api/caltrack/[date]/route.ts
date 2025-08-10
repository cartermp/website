import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"

// Define params type for Next.js 15
type RouteParams = Promise<{ date: string }>;

export async function GET(
  request: Request, 
  { params }: { params: RouteParams }
) {
    const resolvedParams = await params;
    
    // Get entries for the date
    const entries = await sql`
      SELECT date::text, meal_type, meal_name, calories 
      FROM calorie_entries 
      WHERE date = ${resolvedParams.date}::date
    `;
    
    // Get daily stats including excluded status
    const dailyStats = await sql`
      SELECT date, total_calories, breakfast_calories, lunch_calories, 
             dinner_calories, snacks_calories, is_excluded
      FROM daily_stats 
      WHERE date = ${resolvedParams.date}::date
    `;
    
    return NextResponse.json({
        entries,
        dailyStats: dailyStats[0] || null
    });
}