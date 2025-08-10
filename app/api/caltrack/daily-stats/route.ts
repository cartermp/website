import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const dailyStats = await sql`
            SELECT date::text, total_calories, breakfast_calories, lunch_calories, 
                   dinner_calories, snacks_calories, is_excluded
            FROM daily_stats
            ORDER BY date DESC
        `;

        return NextResponse.json(dailyStats);
    } catch (error) {
        console.error('Error fetching daily stats:', error);
        return NextResponse.json(
            { error: "Failed to fetch daily stats" },
            { status: 500 }
        );
    }
}