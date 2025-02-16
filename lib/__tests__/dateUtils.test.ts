import {
    getToday,
    dateToString,
    formatDate,
    groupEntriesByDate,
    compareDates
} from '../dateUtils'

describe('dateUtils', () => {
    describe('getToday', () => {
        it('returns today in YYYY-MM-DD format', () => {
            const today = getToday()
            expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            
            // Verify it matches a new Date
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            expect(today).toBe(`${year}-${month}-${day}`)
        })
    })

    describe('dateToString', () => {
        it('converts Date object to YYYY-MM-DD format', () => {
            const date = new Date('2024-02-15T12:00:00Z')
            expect(dateToString(date)).toBe('2024-02-15')
        })

        it('converts ISO string to YYYY-MM-DD format', () => {
            expect(dateToString('2024-02-15T12:00:00Z')).toBe('2024-02-15')
            expect(dateToString('2024-02-15')).toBe('2024-02-15')
        })

        it('handles different time zones correctly', () => {
            const date = new Date('2024-02-15T23:00:00Z')
            expect(dateToString(date)).toBe('2024-02-15')
        })
    })

    describe('formatDate', () => {
        it('formats date in long format', () => {
            expect(formatDate('2024-02-15')).toBe('February 15, 2024')
        })

        it('handles different date string formats', () => {
            expect(formatDate('2024-02-15T12:00:00Z')).toBe('February 15, 2024')
            expect(formatDate('2024-02-15')).toBe('February 15, 2024')
        })
    })

    describe('groupEntriesByDate', () => {
        const entries = [
            { date: '2024-02-15T12:00:00Z', value: 1 },
            { date: '2024-02-15T15:00:00Z', value: 2 },
            { date: '2024-02-16T12:00:00Z', value: 3 }
        ]

        it('groups entries by date', () => {
            const grouped = groupEntriesByDate(entries)
            
            expect(Object.keys(grouped)).toHaveLength(2)
            expect(grouped['2024-02-15']).toHaveLength(2)
            expect(grouped['2024-02-16']).toHaveLength(1)
        })

        it('normalizes dates in entries', () => {
            const grouped = groupEntriesByDate(entries)
            
            grouped['2024-02-15'].forEach(entry => {
                expect(entry.date).toBe('2024-02-15')
            })
        })

        it('handles empty array', () => {
            const grouped = groupEntriesByDate([])
            expect(Object.keys(grouped)).toHaveLength(0)
        })
    })

    describe('compareDates', () => {
        it('compares dates correctly', () => {
            expect(compareDates('2024-02-15', '2024-02-16')).toBe(-1)
            expect(compareDates('2024-02-15', '2024-02-15')).toBe(0)
            expect(compareDates('2024-02-16', '2024-02-15')).toBe(1)
        })

        it('handles different date formats', () => {
            expect(compareDates('2024-02-15T12:00:00Z', '2024-02-15')).toBe(0)
            expect(compareDates(new Date('2024-02-15'), '2024-02-15')).toBe(0)
        })

        it('ignores time components', () => {
            expect(compareDates('2024-02-15T23:59:59Z', '2024-02-15T00:00:00Z')).toBe(0)
        })
    })
}) 