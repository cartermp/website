import { sql } from "@/lib/db";

export async function updateDailyStats(date: string) {
    // Update stats for the given date
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
            ${date}::date,
            SUM(calories) as total_calories,
            SUM(CASE WHEN meal_type = 'Breakfast' THEN calories ELSE 0 END) as breakfast_calories,
            SUM(CASE WHEN meal_type = 'Lunch' THEN calories ELSE 0 END) as lunch_calories,
            SUM(CASE WHEN meal_type = 'Dinner' THEN calories ELSE 0 END) as dinner_calories,
            SUM(CASE WHEN meal_type = 'Snacks' THEN calories ELSE 0 END) as snacks_calories
        FROM calorie_entries
        WHERE date = ${date}::date
        GROUP BY date
        ON CONFLICT (date) DO UPDATE SET
            total_calories = EXCLUDED.total_calories,
            breakfast_calories = EXCLUDED.breakfast_calories,
            lunch_calories = EXCLUDED.lunch_calories,
            dinner_calories = EXCLUDED.dinner_calories,
            snacks_calories = EXCLUDED.snacks_calories,
            updated_at = CURRENT_TIMESTAMP
    `;
}
