import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { updateDailyStats } from '../helpers'

type CalorieEntry = {
  date: string
  meal_type: string
  meal_name: string
  calories: number
}

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 500 }
      );
    }

    const { entries } = body;
    
    await sql`
      INSERT INTO calorie_entries (date, meal_type, meal_name, calories)
      SELECT 
        (value->>'date')::date,
        value->>'meal_type',
        value->>'meal_name',
        (value->>'calories')::integer
      FROM json_array_elements(${JSON.stringify(entries)}::json) as value
    `

    // Get unique dates from entries and update stats for each
    const uniqueDates = new Set<string>(entries.map((entry: CalorieEntry) => entry.date))
    const dates = Array.from<string>(uniqueDates)
    await Promise.all(dates.map(date => updateDailyStats(date)))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save entries:', error)
    return NextResponse.json(
      { error: 'Failed to save entries' },
      { status: 500 }
    )
  }
}
