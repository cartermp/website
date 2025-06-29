import { sql } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { validateApiAuth, createAuthError } from "@/lib/auth";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const auth = await validateApiAuth(request)
    if (!auth.authenticated) {
        return createAuthError()
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const format = searchParams.get('format') || 'json'

    try {
        let queryResult
        
        if (startDate && endDate) {
            queryResult = await sql`
                SELECT 
                    date::text,
                    total_calories,
                    breakfast_calories,
                    lunch_calories,
                    dinner_calories,
                    snacks_calories,
                    updated_at,
                    EXTRACT(epoch FROM date) as timestamp
                FROM daily_stats 
                WHERE date BETWEEN ${startDate}::date AND ${endDate}::date
                ORDER BY date DESC
            `
        } else if (startDate) {
            queryResult = await sql`
                SELECT 
                    date::text,
                    total_calories,
                    breakfast_calories,
                    lunch_calories,
                    dinner_calories,
                    snacks_calories,
                    updated_at,
                    EXTRACT(epoch FROM date) as timestamp
                FROM daily_stats 
                WHERE date >= ${startDate}::date
                ORDER BY date DESC
            `
        } else {
            // Default to last 6 months
            queryResult = await sql`
                SELECT 
                    date::text,
                    total_calories,
                    breakfast_calories,
                    lunch_calories,
                    dinner_calories,
                    snacks_calories,
                    updated_at,
                    EXTRACT(epoch FROM date) as timestamp
                FROM daily_stats 
                WHERE date >= CURRENT_DATE - INTERVAL '6 months'
                ORDER BY date DESC
            `
        }

        const dailyStats = queryResult.map(row => ({
            date: row.date,
            total_calories: row.total_calories,
            breakdown: {
                breakfast: row.breakfast_calories,
                lunch: row.lunch_calories,
                dinner: row.dinner_calories,
                snacks: row.snacks_calories
            },
            updated_at: row.updated_at,
            timestamp: row.timestamp
        }))

        if (format === 'csv') {
            const csvHeaders = 'date,total_calories,breakfast_calories,lunch_calories,dinner_calories,snacks_calories,updated_at,timestamp\n'
            const csvRows = dailyStats.map(stat => 
                `${stat.date},${stat.total_calories},${stat.breakdown.breakfast},${stat.breakdown.lunch},${stat.breakdown.dinner},${stat.breakdown.snacks},${stat.updated_at},${stat.timestamp}`
            ).join('\n')
            
            return new Response(csvHeaders + csvRows, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="caltrack-daily-stats.csv"'
                }
            })
        }

        return NextResponse.json({
            daily_stats: dailyStats,
            meta: {
                total_count: dailyStats.length,
                start_date: startDate,
                end_date: endDate,
                format
            }
        })

    } catch (error) {
        console.error('Export daily stats error:', error)
        return NextResponse.json(
            { error: 'Failed to export daily stats' }, 
            { status: 500 }
        )
    }
}