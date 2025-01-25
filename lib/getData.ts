const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

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
