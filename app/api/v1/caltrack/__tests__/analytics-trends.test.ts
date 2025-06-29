import { GET } from '@/app/api/v1/caltrack/analytics/trends/route'
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

describe('GET /api/v1/caltrack/analytics/trends', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  const { validateApiAuth } = require('@/lib/auth')
  const { sql } = require('@/lib/db')

  const sampleTrendsData = [
    {
      period: '2024-01-15',
      interval_type: 'day',
      avg_calories: 2150,
      max_calories: 2150,
      min_calories: 2150,
      days_count: 1,
      avg_breakfast: 350,
      avg_lunch: 650,
      avg_dinner: 850,
      avg_snacks: 300
    },
    {
      period: '2024-01-14',
      interval_type: 'day',
      avg_calories: 2050,
      max_calories: 2050,
      min_calories: 2050,
      days_count: 1,
      avg_breakfast: 300,
      avg_lunch: 600,
      avg_dinner: 800,
      avg_snacks: 350
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
  })

  describe('Daily Trends', () => {
    it('should return daily trends by default', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.trends).toHaveLength(2)
      expect(data.trends[0]).toMatchObject({
        period: '2024-01-15',
        interval_type: 'day',
        avg_calories: 2150,
        meal_breakdown: {
          breakfast: 350,
          lunch: 650,
          dinner: 850,
          snacks: 300
        }
      })
      
      expect(data.meta.interval).toBe('daily')
      expect(data.meta.moving_average_periods).toBe(7)
    })

    it('should calculate moving averages correctly', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      // First trend should have moving average of 2150 (only itself)
      expect(data.trends[0].moving_average).toBe(2150)
      // Second trend should have moving average of (2150 + 2050) / 2 = 2100
      expect(data.trends[1].moving_average).toBe(2100)
    })

    it('should calculate trend direction correctly', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.trend_analysis).toBeDefined()
      expect(data.trend_analysis.direction).toBeOneOf(['increasing', 'decreasing', 'stable'])
      expect(data.trend_analysis.slope).toBeInstanceOf('number')
      expect(data.trend_analysis.total_periods).toBe(2)
    })
  })

  describe('Weekly Trends', () => {
    it('should return weekly trends when interval=weekly', async () => {
      const weeklyData = [
        {
          period: '2024-01-08T00:00:00Z',
          interval_type: 'week',
          avg_calories: 2100.5,
          max_calories: 2300,
          min_calories: 1900,
          days_count: 7,
          avg_breakfast: 350,
          avg_lunch: 650,
          avg_dinner: 800,
          avg_snacks: 300
        }
      ]
      sql.mockResolvedValue(weeklyData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends?interval=weekly', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.trends[0]).toMatchObject({
        period: '2024-01-08T00:00:00Z',
        interval_type: 'week',
        avg_calories: 2100.5,
        days_count: 7
      })
      
      expect(data.meta.interval).toBe('weekly')
      expect(data.meta.moving_average_periods).toBe(4)
    })
  })

  describe('Monthly Trends', () => {
    it('should return monthly trends when interval=monthly', async () => {
      const monthlyData = [
        {
          period: '2024-01-01T00:00:00Z',
          interval_type: 'month',
          avg_calories: 2050.75,
          max_calories: 2500,
          min_calories: 1600,
          days_count: 25,
          avg_breakfast: 325,
          avg_lunch: 625,
          avg_dinner: 775,
          avg_snacks: 325
        }
      ]
      sql.mockResolvedValue(monthlyData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends?interval=monthly', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.trends[0]).toMatchObject({
        period: '2024-01-01T00:00:00Z',
        interval_type: 'month',
        avg_calories: 2050.75,
        days_count: 25
      })
      
      expect(data.meta.interval).toBe('monthly')
    })
  })

  describe('Date Filtering', () => {
    it('should filter by date range', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/trends?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN $1::date AND $2::date'),
        ['2024-01-01', '2024-01-31']
      )
    })

    it('should use default 3 months range when no dates provided', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
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
    it('should return trends in CSV format when requested', async () => {
      sql.mockResolvedValue(sampleTrendsData)

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-trends.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('period,interval_type,avg_calories,max_calories,min_calories,days_count,moving_average,breakfast,lunch,dinner,snacks')
      expect(csvData).toContain('2024-01-15,day,2150,2150,2150,1,2150,350,650,850,300')
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to analyze trends')
    })

    it('should handle insufficient data for trend analysis', async () => {
      sql.mockResolvedValue([sampleTrendsData[0]]) // Only one data point

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.trend_analysis.direction).toBe('insufficient_data')
      expect(data.trend_analysis.slope).toBe(0)
      expect(data.trend_analysis.total_periods).toBe(1)
    })

    it('should handle empty results', async () => {
      sql.mockResolvedValue([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/trends', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.trends).toHaveLength(0)
      expect(data.trend_analysis.direction).toBe('insufficient_data')
    })
  })
})