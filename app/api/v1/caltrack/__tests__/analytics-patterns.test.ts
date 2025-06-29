import { GET } from '@/app/api/v1/caltrack/analytics/patterns/route'
import { createMockRequest, mockEnvVars } from './test-utils'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  validateApiAuth: jest.fn(),
  createAuthError: jest.fn(() => new Response('Unauthorized', { status: 401 }))
}))

// Mock the database module
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

describe('GET /api/v1/caltrack/analytics/patterns', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  const { validateApiAuth } = require('@/lib/auth')
  const { sql } = require('@/lib/db')

  const sampleDayOfWeekPatterns = [
    {
      day_of_week: 1,
      day_name: 'Monday',
      total_days: 12,
      avg_daily_calories: 2100,
      avg_breakfast: 350,
      avg_lunch: 650,
      avg_dinner: 800,
      avg_snacks: 300
    },
    {
      day_of_week: 2,
      day_name: 'Tuesday',
      total_days: 11,
      avg_daily_calories: 2050,
      avg_breakfast: 325,
      avg_lunch: 625,
      avg_dinner: 775,
      avg_snacks: 325
    }
  ]

  const sampleMealTimingPatterns = [
    {
      meal_type: 'Breakfast',
      total_entries: 85,
      avg_calories_per_entry: 350,
      days_with_meal: 85,
      meal_frequency_percentage: 94.4
    },
    {
      meal_type: 'Lunch',
      total_entries: 82,
      avg_calories_per_entry: 625,
      days_with_meal: 82,
      meal_frequency_percentage: 91.1
    }
  ]

  const sampleCalorieDistribution = [
    {
      calorie_range: 'Moderate (1800-2199)',
      days_count: 45,
      percentage: 50.0
    },
    {
      calorie_range: 'High (2200-2799)',
      days_count: 30,
      percentage: 33.3
    }
  ]

  const sampleEatingConsistency = [
    {
      meals_per_day: 4,
      days_count: 60,
      percentage: 66.7,
      avg_calories_on_these_days: 2200
    },
    {
      meals_per_day: 3,
      days_count: 25,
      percentage: 27.8,
      avg_calories_on_these_days: 1950
    }
  ]

  const sampleWeekendVsWeekday = [
    {
      day_type: 'Weekday',
      total_days: 65,
      avg_daily_calories: 2100,
      avg_breakfast: 350,
      avg_lunch: 650,
      avg_dinner: 800,
      avg_snacks: 300,
      avg_meals_per_day: 3.8
    },
    {
      day_type: 'Weekend',
      total_days: 25,
      avg_daily_calories: 2300,
      avg_breakfast: 400,
      avg_lunch: 700,
      avg_dinner: 900,
      avg_snacks: 300,
      avg_meals_per_day: 3.6
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
  })

  describe('Pattern Analysis', () => {
    it('should return comprehensive pattern analysis', async () => {
      sql
        .mockResolvedValueOnce(sampleDayOfWeekPatterns)
        .mockResolvedValueOnce(sampleMealTimingPatterns)
        .mockResolvedValueOnce(sampleCalorieDistribution)
        .mockResolvedValueOnce(sampleEatingConsistency)
        .mockResolvedValueOnce(sampleWeekendVsWeekday)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.patterns).toBeDefined()
      expect(data.patterns.day_of_week).toHaveLength(2)
      expect(data.patterns.meal_timing).toHaveLength(2)
      expect(data.patterns.calorie_distribution).toHaveLength(2)
      expect(data.patterns.eating_consistency).toHaveLength(2)
      expect(data.patterns.weekend_vs_weekday).toHaveLength(2)
    })

    it('should return correct day of week patterns', async () => {
      sql
        .mockResolvedValueOnce(sampleDayOfWeekPatterns)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.patterns.day_of_week[0]).toMatchObject({
        day_of_week: 1,
        day_name: 'Monday',
        total_days: 12,
        avg_daily_calories: 2100,
        meal_breakdown: {
          breakfast: 350,
          lunch: 650,
          dinner: 800,
          snacks: 300
        }
      })
    })

    it('should return correct meal timing patterns', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sampleMealTimingPatterns)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.patterns.meal_timing[0]).toMatchObject({
        meal_type: 'Breakfast',
        total_entries: 85,
        avg_calories_per_entry: 350,
        days_with_meal: 85,
        frequency_percentage: 94.4
      })
    })

    it('should return correct calorie distribution', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sampleCalorieDistribution)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.patterns.calorie_distribution[0]).toMatchObject({
        calorie_range: 'Moderate (1800-2199)',
        days_count: 45,
        percentage: 50.0
      })
    })

    it('should return correct eating consistency patterns', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sampleEatingConsistency)
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.patterns.eating_consistency[0]).toMatchObject({
        meals_per_day: 4,
        days_count: 60,
        percentage: 66.7,
        avg_calories: 2200
      })
    })

    it('should return correct weekend vs weekday patterns', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sampleWeekendVsWeekday)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.patterns.weekend_vs_weekday[0]).toMatchObject({
        day_type: 'Weekday',
        total_days: 65,
        avg_daily_calories: 2100,
        avg_meals_per_day: 3.8,
        meal_breakdown: {
          breakfast: 350,
          lunch: 650,
          dinner: 800,
          snacks: 300
        }
      })
    })
  })

  describe('Date Filtering', () => {
    it('should filter by date range', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/patterns?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN $1::date AND $2::date'),
        ['2024-01-01', '2024-01-31']
      )
    })

    it('should use default 3 months range when no dates provided', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= CURRENT_DATE - INTERVAL \'3 months\''),
        []
      )
    })
  })

  describe('CSV Export', () => {
    it('should return patterns in CSV format when requested', async () => {
      sql
        .mockResolvedValueOnce(sampleDayOfWeekPatterns)
        .mockResolvedValueOnce(sampleMealTimingPatterns)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-patterns.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('Pattern Type,Metric,Value,Additional Info')
      expect(csvData).toContain('Day of Week,Monday Avg Calories,2100,12 days')
      expect(csvData).toContain('Meal Timing,Breakfast Frequency,94.4%,85 entries')
    })
  })

  describe('Metadata', () => {
    it('should include metadata in response', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/patterns?start_date=2024-01-01',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta).toMatchObject({
        start_date: '2024-01-01',
        end_date: null,
        format: 'json',
        analysis_period: 'custom'
      })
    })

    it('should indicate default analysis period', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta.analysis_period).toBe('3 months')
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to analyze patterns')
    })

    it('should handle empty results gracefully', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/patterns', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.patterns.day_of_week).toHaveLength(0)
      expect(data.patterns.meal_timing).toHaveLength(0)
      expect(data.patterns.calorie_distribution).toHaveLength(0)
    })
  })
})