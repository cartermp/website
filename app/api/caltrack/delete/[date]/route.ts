import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { updateDailyStats } from '../../helpers'

// Define params type for Next.js 15
type RouteParams = Promise<{ date: string }>;

export async function DELETE(
  request: Request,
  { params }: { params: RouteParams }
) {
  try {
    const resolvedParams = await params;
    
    await sql`
      DELETE FROM calorie_entries 
      WHERE date = ${resolvedParams.date}::date
    `
    
    // Update stats for the deleted date
    await updateDailyStats(resolvedParams.date)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete entries:', error)
    return NextResponse.json(
      { error: 'Failed to delete entries' },
      { status: 500 }
    )
  }
}
