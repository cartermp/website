// lib/dateUtils.ts

/**
 * Gets today's date in YYYY-MM-DD format, normalized to UTC midnight
 */
export function getToday(): string {
    const now = new Date()
    return dateToString(now)
}

/**
 * Converts any date string or Date object to YYYY-MM-DD format
 * Handles various input formats including ISO strings with time components
 */
export function dateToString(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toISOString().split('T')[0]
}

/**
 * Formats a date string for display
 * @param dateStr Date string in any format
 */
export function formatDate(dateStr: string): string {
    // Ensure we're working with YYYY-MM-DD
    const normalizedDate = dateToString(dateStr)
    return new Date(normalizedDate + 'T00:00:00Z').toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: 'UTC'
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

    const date = new Date(dateStr + 'T00:00:00Z')
    return date.toString() !== 'Invalid Date'
}

/**
 * Normalizes a Date object or string to UTC midnight
 * @param date Date object or string to normalize
 */
export function normalizeToUTCMidnight(date: Date | string): Date {
    const dateStr = dateToString(date)
    return new Date(dateStr + 'T00:00:00Z')
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
    const d1 = normalizeToUTCMidnight(date1)
    const d2 = normalizeToUTCMidnight(date2)
    return d1 < d2 ? -1 : d1 > d2 ? 1 : 0
}
