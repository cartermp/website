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
    const mealType = searchParams.get('meal_type')

    try {
        let queryResult
        
        if (startDate && endDate) {
            // Date range query
            let query = `
                SELECT date::text, meal_type, meal_name, calories, 
                       EXTRACT(epoch FROM date) as timestamp
                FROM calorie_entries 
                WHERE date BETWEEN $1::date AND $2::date
            `
            const params = [startDate, endDate]
            
            if (mealType) {
                query += ` AND meal_type = $3`
                params.push(mealType)
            }
            
            query += ` ORDER BY date DESC, meal_type`
            queryResult = await sql(query, params)
        } else if (startDate) {
            // Start date only
            let query = `
                SELECT date::text, meal_type, meal_name, calories,
                       EXTRACT(epoch FROM date) as timestamp
                FROM calorie_entries 
                WHERE date >= $1::date
            `
            const params = [startDate]
            
            if (mealType) {
                query += ` AND meal_type = $2`
                params.push(mealType)
            }
            
            query += ` ORDER BY date DESC, meal_type`
            queryResult = await sql(query, params)
        } else {
            // All entries (default to last 6 months for performance)
            let query = `
                SELECT date::text, meal_type, meal_name, calories,
                       EXTRACT(epoch FROM date) as timestamp
                FROM calorie_entries 
                WHERE date >= CURRENT_DATE - INTERVAL '6 months'
            `
            const params = []
            
            if (mealType) {
                query += ` AND meal_type = $1`
                params.push(mealType)
            }
            
            query += ` ORDER BY date DESC, meal_type`
            queryResult = await sql(query, params)
        }

        const entries = queryResult.map(row => ({
            date: row.date,
            meal_type: row.meal_type,
            meal_name: row.meal_name,
            calories: row.calories,
            timestamp: row.timestamp
        }))

        if (format === 'csv') {
            const csvHeaders = 'date,meal_type,meal_name,calories,timestamp\n'
            const csvRows = entries.map(entry => 
                `${entry.date},${entry.meal_type},"${entry.meal_name}",${entry.calories},${entry.timestamp}`
            ).join('\n')
            
            return new Response(csvHeaders + csvRows, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="caltrack-entries.csv"'
                }
            })
        }

        return NextResponse.json({
            entries,
            meta: {
                total_count: entries.length,
                start_date: startDate,
                end_date: endDate,
                meal_type_filter: mealType,
                format
            }
        })

    } catch (error) {
        console.error('Export entries error:', error)
        return NextResponse.json(
            { error: 'Failed to export entries' }, 
            { status: 500 }
        )
    }
}