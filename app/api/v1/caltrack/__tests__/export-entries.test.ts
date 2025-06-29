import { GET } from '@/app/api/v1/caltrack/export/entries/route'
import { createMockRequest, mockEnvVars, sampleCalorieEntries } from './test-utils'

// Mock the auth module
jest.mock('@/lib/auth', () => ({
  validateApiAuth: jest.fn(),
  createAuthError: jest.fn(() => new Response('Unauthorized', { status: 401 }))
}))

// Mock the database module
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init = {}) => ({
      status: init?.status || 200,
      json: () => Promise.resolve(data),
      headers: new Map(Object.entries(init?.headers || {}))
    }))
  }
}))

describe('GET /api/v1/caltrack/export/entries', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  const { validateApiAuth } = require('@/lib/auth')
  const { sql } = require('@/lib/db')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries')
      const response = await GET(request)

      expect(response.status).toBe(401)
      expect(validateApiAuth).toHaveBeenCalledWith(request)
    })

    it('should proceed when authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(validateApiAuth).toHaveBeenCalledWith(request)
    })
  })

  describe('Data Export', () => {
    beforeEach(() => {
      validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
    })

    it('should return entries in JSON format by default', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.entries).toHaveLength(3)
      expect(data.entries[0]).toMatchObject({
        date: '2024-01-15',
        meal_type: 'Breakfast',
        meal_name: 'Oatmeal with berries',
        calories: 350
      })
      expect(data.meta.total_count).toBe(3)
      expect(data.meta.format).toBe('json')
    })

    it('should return entries in CSV format when requested', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-entries.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('date,meal_type,meal_name,calories,timestamp')
      expect(csvData).toContain('2024-01-15,Breakfast,"Oatmeal with berries",350')
    })

    it('should filter by date range', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/entries?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN $1::date AND $2::date'),
        ['2024-01-01', '2024-01-31']
      )
    })

    it('should filter by start date only', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/entries?start_date=2024-01-01',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= $1::date'),
        ['2024-01-01']
      )
    })

    it('should filter by meal type', async () => {
      sql.mockResolvedValue(sampleCalorieEntries.filter(e => e.meal_type === 'Breakfast'))

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/entries?meal_type=Breakfast',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('AND meal_type = $1'),
        ['Breakfast']
      )
    })

    it('should use default 6 months range when no dates provided', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries', {
        apiKey: 'test-api-key'
      })
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date >= CURRENT_DATE - INTERVAL \'6 months\''),
        []
      )
    })

    it('should include metadata in response', async () => {
      sql.mockResolvedValue(sampleCalorieEntries)

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/export/entries?start_date=2024-01-01&meal_type=Breakfast',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta).toMatchObject({
        total_count: 3,
        start_date: '2024-01-01',
        end_date: null,
        meal_type_filter: 'Breakfast',
        format: 'json'
      })
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to export entries')
    })

    it('should handle empty results', async () => {
      sql.mockResolvedValue([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/export/entries', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.entries).toHaveLength(0)
      expect(data.meta.total_count).toBe(0)
    })
  })
})