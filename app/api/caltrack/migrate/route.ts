import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // Create the daily_stats table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS daily_stats (
                date DATE PRIMARY KEY,
                total_calories INTEGER,
                breakfast_calories INTEGER,
                lunch_calories INTEGER,
                dinner_calories INTEGER,
                snacks_calories INTEGER,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        // Create the api_keys table if it doesn't exist
        await sql`
            CREATE TABLE IF NOT EXISTS api_keys (
                id SERIAL PRIMARY KEY,
                user_email VARCHAR(255) NOT NULL,
                key_hash VARCHAR(255) NOT NULL UNIQUE,
                name VARCHAR(100) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP WITH TIME ZONE,
                is_active BOOLEAN DEFAULT TRUE
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_user_email ON api_keys (user_email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys (key_hash)`;

        // Populate the daily_stats table with existing data
        await sql`
            INSERT INTO daily_stats (
                date,
                total_calories,
                breakfast_calories,
                lunch_calories,
                dinner_calories,
                snacks_calories
            )
            SELECT 
                date,
                SUM(calories) as total_calories,
                SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as breakfast_calories,
                SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as lunch_calories,
                SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as dinner_calories,
                SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as snacks_calories
            FROM calorie_entries
            GROUP BY date
            ON CONFLICT (date) DO UPDATE SET
                total_calories = EXCLUDED.total_calories,
                breakfast_calories = EXCLUDED.breakfast_calories,
                lunch_calories = EXCLUDED.lunch_calories,
                dinner_calories = EXCLUDED.dinner_calories,
                snacks_calories = EXCLUDED.snacks_calories,
                updated_at = CURRENT_TIMESTAMP
        `;

        return NextResponse.json({ message: "Migration completed successfully" });
    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({ error: "Migration failed" }, { status: 500 });
    }
}
