import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"

export async function GET() {
    const data = await sql`SELECT date, meal_type, meal_name, calories 
                          FROM calorie_entries 
                          ORDER BY date DESC`;
    return NextResponse.json(data);
  }