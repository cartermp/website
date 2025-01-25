import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { date: string } }) {
    const data = await sql`
      SELECT date::text, meal_type, meal_name, calories 
      FROM calorie_entries 
      WHERE date = ${params.date}::date
    `;
    return NextResponse.json(data);
}