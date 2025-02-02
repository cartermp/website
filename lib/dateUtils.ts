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
 * Converts any date string to YYYY-MM-DD format, properly handling UTC timestamps
 */
export function dateToString(date: string | Date): string {
    // Handle ISO strings with time components
    const d = typeof date === 'string' ? new Date(date) : date
    // Since these are UTC timestamps, use UTC methods
    const year = d.getUTCFullYear()
    const month = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Formats a date for display
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr) // Will parse as UTC since string includes Z
    const year = date.getUTCFullYear()
    const month = date.getUTCMonth()  // 0-based
    const day = date.getUTCDate()
    
    return new Date(year, month, day).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
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