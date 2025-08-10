// Get the base URL for API calls - works in both server and client contexts
function getBaseUrl() {
    // If we're in the browser, use the current origin
    if (typeof window !== 'undefined') {
        return window.location.origin
    }
    
    // If we're on the server and have the environment variable, use it
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
    }
    
    // Fallback for development
    return 'http://localhost:3000'
}

const baseUrl = getBaseUrl()

export async function getData() {
    const res = await fetch(`${baseUrl}/api/caltrack`, {
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error('Failed to fetch all calorie tracking data');
    return res.json();
}

// Server-side version of getData for direct database access
export async function getStaticData() {
    const { sql } = await import('@/lib/db')
    
    // Get the last 6 months of entries for overall stats
    const entries = await sql`
        SELECT date, meal_type, meal_name, calories 
        FROM calorie_entries 
        WHERE date >= CURRENT_DATE - INTERVAL '6 months'
        ORDER BY date DESC, meal_type` as any[]

    // Get the overall average calories per day (excluding days marked as excluded)
    const overallStats = await sql`
        SELECT 
            ROUND(AVG(daily_total)::numeric, 0) as overall_average
        FROM (
            SELECT 
                ce.date,
                SUM(ce.calories) as daily_total
            FROM calorie_entries ce
            LEFT JOIN daily_stats ds ON ce.date = ds.date
            WHERE COALESCE(ds.is_excluded, false) = false
            GROUP BY ce.date
        ) daily_totals` as any[]

    // Get today's summary stats
    const todayStats = await sql`
        SELECT 
            date,
            total_calories,
            breakfast_calories,
            lunch_calories,
            dinner_calories,
            snacks_calories,
            is_excluded
        FROM daily_stats
        WHERE date = CURRENT_DATE` as any[]

    return {
        entries: entries as import('@/lib/types').CalorieEntry[],
        stats: (todayStats[0] as import('@/lib/types').DailyStats) || null,
        overallAverage: overallStats[0].overall_average
    }
}

export async function getEntriesForDate(date: string) {
    const res = await fetch(`${baseUrl}/api/caltrack/${date}`, {
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error(`Failed to fetch calorie tracking data for ${date}`);
    return res.json();
}

// Special function for static page generation that uses direct DB queries
export async function getStaticEntries(date: string) {
    const { sql } = await import('@/lib/db')
    const data = await sql`
        SELECT date::text, meal_type, meal_name, calories 
        FROM calorie_entries 
        WHERE date = ${date}::date
    `
    return data
}

// Get entries and daily stats for a specific date (for server-side use)
export async function getStaticEntriesWithStats(date: string) {
    const { sql } = await import('@/lib/db')
    
    // Get entries for the date
    const entries = await sql`
        SELECT date::text, meal_type, meal_name, calories 
        FROM calorie_entries 
        WHERE date = ${date}::date
    ` as any[]
    
    // Get daily stats including excluded status
    const dailyStats = await sql`
        SELECT date, total_calories, breakfast_calories, lunch_calories, 
               dinner_calories, snacks_calories, is_excluded
        FROM daily_stats 
        WHERE date = ${date}::date
    ` as any[]
    
    return {
        entries: entries as import('@/lib/types').CalorieEntry[],
        dailyStats: (dailyStats[0] as import('@/lib/types').DailyStats) || null
    }
}

// Get entries for a date range (inclusive)
export async function getStaticEntriesForRange(startDate: string, endDate: string) {
    const { sql } = await import('@/lib/db')
    const data = await sql`
        SELECT date::text, meal_type, meal_name, calories 
        FROM calorie_entries 
        WHERE date BETWEEN ${startDate}::date AND ${endDate}::date
        ORDER BY date ASC
    `
    return data
}

// Special function to get all unique dates for static generation
export async function getStaticDates() {
    const { sql } = await import('@/lib/db')
    const data = await sql`
        SELECT DISTINCT date::text
        FROM calorie_entries
        ORDER BY date DESC
    `
    return data.map(row => row.date)
}

export async function getFoodItems() {
    const res = await fetch(`${baseUrl}/api/caltrack/foods`, {
        method: 'GET',
        cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to fetch food items');
    return res.json();
}


export async function getDailyStats() {
    const res = await fetch(`${baseUrl}/api/caltrack/daily-stats`, {
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error('Failed to fetch daily stats');
    return res.json();
}
