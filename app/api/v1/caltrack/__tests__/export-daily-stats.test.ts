import { GET } from '@/app/api/v1/caltrack/export/daily-stats/route'
import { createMockRequest, mockEnvVars, sampleDailyStats } from './test-utils'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  validateApiAuth: jest.fn(),
  createAuthError: jest.fn(() => new Response('Unauthorized', { status: 401 }))
}))

// Mock the database module
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

describe('GET /api/v1/caltrack/export/daily-stats', () => {
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
    it('should return daily stats in JSON format by default', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.daily_stats).toHaveLength(1)
      expect(data.daily_stats[0]).toMatchObject({
        date: '2024-01-15',
        total_calories: 1450,
        breakdown: {
          breakfast: 350,
          lunch: 450,
          dinner: 650,
          snacks: 0
        }
      })
      expect(data.meta.total_count).toBe(1)
      expect(data.meta.format).toBe('json')
    })

    it('should return daily stats in CSV format when requested', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-daily-stats.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('date,total_calories,breakfast_calories,lunch_calories,dinner_calories,snacks_calories')
      expect(csvData).toContain('2024-01-15,1450,350,450,650,0')
    })

    it('should filter by date range', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/daily-stats?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(expect.arrayContaining([
        expect.stringContaining('WHERE date BETWEEN'),
        '2024-01-01',
        '2024-01-31'
      ]))
    })

    it('should filter by start date only', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/daily-stats?start_date=2024-01-01',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(expect.arrayContaining([
        expect.stringContaining('WHERE date >='),
        '2024-01-01'
      ]))
    })

    it('should use default 6 months range when no dates provided', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats', {
        apiKey: 'test-api-key'
      })
      await GET(request)

      expect(sql).toHaveBeenCalledWith(expect.arrayContaining([
        expect.stringContaining('WHERE date >= CURRENT_DATE - INTERVAL \'6 months\'')
      ]))
    })

    it('should include all required fields in JSON response', async () => {
      const mockStats = [{
        ...sampleDailyStats[0],
        updated_at: '2024-01-15T20:30:00Z'
      }]
      sql.mockResolvedValue(mockStats)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      const stat = data.daily_stats[0]
      expect(stat).toHaveProperty('date')
      expect(stat).toHaveProperty('total_calories')
      expect(stat).toHaveProperty('breakdown')
      expect(stat.breakdown).toHaveProperty('breakfast')
      expect(stat.breakdown).toHaveProperty('lunch')
      expect(stat.breakdown).toHaveProperty('dinner')
      expect(stat.breakdown).toHaveProperty('snacks')
      expect(stat).toHaveProperty('updated_at')
      expect(stat).toHaveProperty('timestamp')
    })

    it('should include metadata in response', async () => {
      sql.mockResolvedValue(sampleDailyStats)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/daily-stats?start_date=2024-01-01&format=json',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta).toMatchObject({
        total_count: 1,
        start_date: '2024-01-01',
        end_date: null,
        format: 'json'
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to export daily stats')
    })

    it('should handle empty results', async () => {
      sql.mockResolvedValue([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/daily-stats', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.daily_stats).toHaveLength(0)
      expect(data.meta.total_count).toBe(0)
    })
  })
})