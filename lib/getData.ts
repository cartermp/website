const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')

export async function getData() {
    const res = await fetch(`${baseUrl}/api/caltrack`, {
        method: 'GET',
        cache: 'no-store',
        next: { revalidate: 0 }
    });
    if (!res.ok) throw new Error('Failed to fetch all calorie tracking data');
    return res.json();
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
