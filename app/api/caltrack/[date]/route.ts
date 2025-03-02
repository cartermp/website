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
    const data = await sql`
      SELECT date::text, meal_type, meal_name, calories 
      FROM calorie_entries 
      WHERE date = ${resolvedParams.date}::date
    `;
    return NextResponse.json(data);
}