import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { entries } = await request.json()
    
    await sql`
      INSERT INTO calorie_entries (date, meal_type, meal_name, calories)
      SELECT 
        (value->>'date')::date,
        value->>'meal_type',
        value->>'meal_name',
        (value->>'calories')::integer
      FROM json_array_elements(${JSON.stringify(entries)}::json) as value
    `
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save entries:', error)
    return NextResponse.json(
      { error: 'Failed to save entries' },
      { status: 500 }
    )
  }
}
