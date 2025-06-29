import { GET } from '@/app/api/v1/caltrack/export/summary/route'
import { createMockRequest, mockEnvVars, sampleSummaryStats, sampleMealTypeStats, sampleTopFoods } from './test-utils'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  validateApiAuth: jest.fn(),
  createAuthError: jest.fn(() => new Response('Unauthorized', { status: 401 }))
}))

// Mock the database module
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

describe('GET /api/v1/caltrack/export/summary', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  const { validateApiAuth } = require('@/lib/auth')
  const { sql } = require('@/lib/db')

  beforeEach(() => {
    jest.clearAllMocks()
    validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
  })

  describe('Data Export', () => {
    it('should return comprehensive summary in JSON format', async () => {
      // Mock multiple SQL calls for the summary endpoint
      sql
        .mockResolvedValueOnce(sampleSummaryStats) // Overall stats
        .mockResolvedValueOnce(sampleMealTypeStats) // Meal type breakdown
        .mockResolvedValueOnce(sampleTopFoods) // Top foods
        .mockResolvedValueOnce([]) // Weekly trends
        .mockResolvedValueOnce([]) // Monthly breakdown

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.summary).toBeDefined()
      expect(data.summary.overall).toMatchObject({
        total_days: 30,
        avg_daily_calories: 2100.50,
        max_daily_calories: 2800,
        min_daily_calories: 1650,
        stddev_daily_calories: 245.30
      })
      
      expect(data.summary.meal_types).toHaveLength(2)
      expect(data.summary.meal_types[0]).toMatchObject({
        meal_type: 'Dinner',
        entry_count: 25,
        avg_calories: 750.50,
        total_calories: 18762
      })
      
      expect(data.summary.top_foods).toHaveLength(2)
      expect(data.summary.top_foods[0]).toMatchObject({
        meal_name: 'Chicken breast',
        frequency: 15,
        avg_calories: 300,
        total_calories: 4500
      })
    })

    it('should return summary in CSV format when requested', async () => {
      sql
        .mockResolvedValueOnce(sampleSummaryStats)
        .mockResolvedValueOnce(sampleMealTypeStats)
        .mockResolvedValueOnce(sampleTopFoods)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-summary.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('Section,Metric,Value')
      expect(csvData).toContain('Overall,Total Days,30')
      expect(csvData).toContain('Overall,Avg Daily Calories,2100.5')
      expect(csvData).toContain('Meal Types,Dinner - Entry Count,25')
    })

    it('should filter by date range', async () => {
      sql
        .mockResolvedValueOnce(sampleSummaryStats)
        .mockResolvedValueOnce(sampleMealTypeStats)
        .mockResolvedValueOnce(sampleTopFoods)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/summary?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      // Check that SQL queries include date filtering
      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN $1::date AND $2::date'),
        ['2024-01-01', '2024-01-31']
      )
    })

    it('should use default 6 months range when no dates provided', async () => {
      sql
        .mockResolvedValueOnce(sampleSummaryStats)
        .mockResolvedValueOnce(sampleMealTypeStats)
        .mockResolvedValueOnce(sampleTopFoods)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary', {
        apiKey: 'test-api-key'
      })
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= CURRENT_DATE - INTERVAL \'6 months\''),
        []
      )
    })

    it('should include metadata in response', async () => {
      sql
        .mockResolvedValueOnce(sampleSummaryStats)
        .mockResolvedValueOnce(sampleMealTypeStats)
        .mockResolvedValueOnce(sampleTopFoods)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/summary?start_date=2024-01-01',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta).toMatchObject({
        start_date: '2024-01-01',
        end_date: null,
        format: 'json'
      })
      expect(data.meta.generated_at).toBeDefined()
      expect(new Date(data.meta.generated_at)).toBeInstanceOf(Date)
    })

    it('should handle weekly and monthly trends data', async () => {
      const weeklyTrends = [
        {
          week_start: '2024-01-08T00:00:00Z',
          avg_weekly_calories: 2150.5,
          days_in_week: 7
        }
      ]
      
      const monthlyStats = [
        {
          month: '2024-01-01T00:00:00Z',
          avg_monthly_calories: 2100.75,
          days_with_entries: 25,
          total_monthly_calories: 52518
        }
      ]

      sql
        .mockResolvedValueOnce(sampleSummaryStats)
        .mockResolvedValueOnce(sampleMealTypeStats)
        .mockResolvedValueOnce(sampleTopFoods)
        .mockResolvedValueOnce(weeklyTrends)
        .mockResolvedValueOnce(monthlyStats)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.summary.weekly_trends).toHaveLength(1)
      expect(data.summary.weekly_trends[0]).toMatchObject({
        week_start: '2024-01-08T00:00:00Z',
        avg_weekly_calories: 2150.5,
        days_in_week: 7
      })

      expect(data.summary.monthly_breakdown).toHaveLength(1)
      expect(data.summary.monthly_breakdown[0]).toMatchObject({
        month: '2024-01-01T00:00:00Z',
        avg_monthly_calories: 2100.75,
        days_with_entries: 25,
        total_monthly_calories: 52518
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to generate summary')
    })

    it('should handle empty results gracefully', async () => {
      sql
        .mockResolvedValueOnce([]) // Empty overall stats
        .mockResolvedValueOnce([]) // Empty meal type stats
        .mockResolvedValueOnce([]) // Empty top foods
        .mockResolvedValueOnce([]) // Empty weekly trends
        .mockResolvedValueOnce([]) // Empty monthly stats

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/summary', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.summary.overall.total_days).toBe(0)
      expect(data.summary.meal_types).toHaveLength(0)
      expect(data.summary.top_foods).toHaveLength(0)
    })
  })
})