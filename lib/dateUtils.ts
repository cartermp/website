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
 * Preserves the timezone of the input date
 */
export function dateToString(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

/**
 * Formats a date string for display
 * @param dateStr Date string in any format
 */
export function formatDate(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    })
}

/**
 * Validates if a string is a valid YYYY-MM-DD date
 * @param dateStr Date string to validate
 */
export function isValidDateString(dateStr: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return false
    }

    const date = new Date(dateStr)
    return date.toString() !== 'Invalid Date'
}

/**
 * Normalizes a Date object or string to local timezone midnight
 * @param date Date object or string to normalize
 */
export function normalizeToLocalMidnight(date: Date | string): Date {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/**
 * Groups entries by date, ensuring consistent date format in local timezone
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
 * Compares two dates (ignoring time) in local timezone
 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
export function compareDates(date1: string | Date, date2: string | Date): number {
    const d1 = normalizeToLocalMidnight(date1)
    const d2 = normalizeToLocalMidnight(date2)
    return d1 < d2 ? -1 : d1 > d2 ? 1 : 0
}
