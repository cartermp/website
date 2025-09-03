import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { updateDailyStats } from '../../helpers'

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { oldName, newName, newCalories } = body

        if (!oldName || !newName || !newCalories) {
            return NextResponse.json(
                { error: 'Missing required fields: oldName, newName, newCalories' },
                { status: 400 }
            )
        }

        if (typeof newCalories !== 'number' || newCalories <= 0) {
            return NextResponse.json(
                { error: 'Calories must be a positive number' },
                { status: 400 }
            )
        }

        // First, get all dates that will be affected to update their daily stats
        const affectedDates = await sql`
            SELECT DISTINCT date 
            FROM calorie_entries 
            WHERE meal_name = ${oldName}
        `

        // Update the meal entries
        await sql`
            UPDATE calorie_entries 
            SET meal_name = ${newName}, calories = ${newCalories}
            WHERE meal_name = ${oldName}
        `

        // Update daily stats for all affected dates
        const dates = affectedDates.map((row: any) => row.date)
        await Promise.all(dates.map((date: string) => updateDailyStats(date)))

        return NextResponse.json({ 
            success: true,
            affectedDates: dates.length
        })
    } catch (error) {
        console.error('Failed to update meal:', error)
        return NextResponse.json(
            { error: 'Failed to update meal entries' },
            { status: 500 }
        )
    }
}