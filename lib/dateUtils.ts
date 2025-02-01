// lib/dateUtils.ts

/**
 * Gets today's date in YYYY-MM-DD format in the user's local timezone
 */
export function getToday(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Converts any date string or Date object to YYYY-MM-DD format
 * Handles various input formats including ISO strings with time components
 */
export function dateToString(date: string | Date): string {
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
    }

    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Formats a date for display using the user's timezone
 */
export function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-').map(Number)
    // Create date in UTC by using Date.UTC()
    const date = new Date(Date.UTC(year, month - 1, day))
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: 'UTC'  // Ensure we interpret the date in UTC
    })
}

/**
 * Groups entries by date, ensuring consistent date format
 * @param entries Array of entries with a date property
 */
export function groupEntriesByDate<T extends { date: string }>(entries: T[]): Record<string, T[]> {
    return entries.reduce((acc, entry) => {
        const dateKey = dateToString(entry.date)
        if (!acc[dateKey]) {
            acc[dateKey] = []
        }
        acc[dateKey].push({
            ...entry,
            date: dateKey // Ensure the entry itself has the normalized date
        })
        return acc
    }, {} as Record<string, T[]>)
}

/**
 * Compares two dates (ignoring time)
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: string | Date, date2: string | Date): number {
    const d1 = new Date(dateToString(date1))
    const d2 = new Date(dateToString(date2))
    return d1 < d2 ? -1 : d1 > d2 ? 1 : 0
}