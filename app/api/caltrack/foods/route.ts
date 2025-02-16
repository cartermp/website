import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"

export async function GET() {
    const data = await sql`
        WITH RankedEntries AS (
            SELECT 
                meal_name,
                calories,
                ROW_NUMBER() OVER (PARTITION BY meal_name ORDER BY date DESC) as rn
            FROM calorie_entries
            WHERE meal_name IS NOT NULL AND meal_name != ''
        )
        SELECT meal_name, calories
        FROM RankedEntries
        WHERE rn = 1
        ORDER BY meal_name ASC;
    `;
    
    return NextResponse.json(data);
} 