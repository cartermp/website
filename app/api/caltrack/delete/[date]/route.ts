import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { updateDailyStats } from '../../helpers'

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    await sql`
      DELETE FROM calorie_entries 
      WHERE date = ${params.date}::date
    `
    
    // Update stats for the deleted date
    await updateDailyStats(params.date)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete entries:', error)
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    )
  }
}
