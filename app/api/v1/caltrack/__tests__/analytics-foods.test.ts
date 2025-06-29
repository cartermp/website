import { GET } from '@/app/api/v1/caltrack/analytics/foods/route'
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

describe('GET /api/v1/caltrack/analytics/foods', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  const { validateApiAuth } = require('@/lib/auth')
  const { sql } = require('@/lib/db')

  const sampleTopFoodsByFrequency = [
    {
      meal_name: 'Chicken breast',
      frequency: 15,
      avg_calories: 300,
      min_calories: 250,
      max_calories: 350,
      total_calories: 4500,
      days_consumed: 12,
      meal_types: ['Lunch', 'Dinner']
    },
    {
      meal_name: 'Rice',
      frequency: 12,
      avg_calories: 200,
      min_calories: 180,
      max_calories: 220,
      total_calories: 2400,
      days_consumed: 10,
      meal_types: ['Lunch', 'Dinner']
    }
  ]

  const sampleTopFoodsByCalories = [
    {
      meal_name: 'Large pizza slice',
      max_calories: 800,
      avg_calories: 750,
      frequency: 3,
      total_calories: 2250,
      days_consumed: 3,
      meal_types: ['Dinner']
    }
  ]

  const sampleFoodDiversity = [
    {
      unique_foods: 156,
      total_entries: 450,
      diversity_ratio: 34.7
    }
  ]

  const sampleFoodsByMealType = [
    {
      meal_type: 'Dinner',
      unique_foods: 45,
      total_entries: 120,
      avg_calories: 650,
      total_calories: 78000
    },
    {
      meal_type: 'Lunch',
      unique_foods: 38,
      total_entries: 110,
      avg_calories: 500,
      total_calories: 55000
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    validateApiAuth.mockResolvedValue({ authenticated: true, method: 'api-key' })
  })

  describe('Food Analytics', () => {
    it('should return comprehensive food analytics', async () => {
      sql
        .mockResolvedValueOnce(sampleTopFoodsByFrequency) // top_foods_by_frequency
        .mockResolvedValueOnce(sampleTopFoodsByCalories) // top_foods_by_calories
        .mockResolvedValueOnce(sampleTopFoodsByFrequency) // top_foods_by_total_calories
        .mockResolvedValueOnce(sampleFoodDiversity) // food_diversity
        .mockResolvedValueOnce(sampleFoodsByMealType) // foods_by_meal_type
        .mockResolvedValueOnce(sampleTopFoodsByFrequency) // calorie_efficiency
        .mockResolvedValueOnce([]) // recent_foods

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.food_analytics).toBeDefined()
      expect(data.food_analytics.top_foods_by_frequency).toHaveLength(2)
      expect(data.food_analytics.top_foods_by_calories).toHaveLength(1)
      expect(data.food_analytics.food_diversity).toBeDefined()
      expect(data.food_analytics.foods_by_meal_type).toHaveLength(2)
    })

    it('should return correct top foods by frequency', async () => {
      sql
        .mockResolvedValueOnce(sampleTopFoodsByFrequency)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.food_analytics.top_foods_by_frequency[0]).toMatchObject({
        meal_name: 'Chicken breast',
        frequency: 15,
        avg_calories: 300,
        min_calories: 250,
        max_calories: 350,
        total_calories: 4500,
        days_consumed: 12,
        meal_types: ['Lunch', 'Dinner']
      })
    })

    it('should return correct food diversity metrics', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(sampleFoodDiversity)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.food_analytics.food_diversity).toMatchObject({
        unique_foods: 156,
        total_entries: 450,
        diversity_ratio: 34.7
      })
    })

    it('should return foods breakdown by meal type', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce(sampleFoodsByMealType)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)
      const data = await response.json()

      expect(data.food_analytics.foods_by_meal_type[0]).toMatchObject({
        meal_type: 'Dinner',
        unique_foods: 45,
        total_entries: 120,
        avg_calories: 650,
        total_calories: 78000
      })
    })
  })

  describe('Filtering', () => {
    it('should filter by date range', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/foods?start_date=2024-01-01&end_date=2024-01-31',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE date BETWEEN $1::date AND $2::date'),
        ['2024-01-01', '2024-01-31']
      )
    })

    it('should filter by meal type', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/foods?meal_type=Breakfast',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('WHERE meal_type = $1'),
        ['Breakfast']
      )
    })

    it('should respect limit parameter', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/foods?limit=20',
        { apiKey: 'test-api-key' }
      )
      await GET(request)

      expect(sql).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 20'),
        []
      )
    })

    it('should use default 3 months range when no dates provided', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
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
    it('should return food analytics in CSV format when requested', async () => {
      sql
        .mockResolvedValueOnce(sampleTopFoodsByFrequency)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods?format=csv', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(response.headers.get('Content-Disposition')).toContain('attachment; filename="caltrack-food-analytics.csv"')
      
      const csvData = await response.text()
      expect(csvData).toContain('Category,Food Name,Frequency,Avg Calories,Total Calories,Days Consumed,Meal Types')
      expect(csvData).toContain('Top by Frequency,Chicken breast,15,300,4500,12,"Lunch, Dinner"')
    })
  })

  describe('Metadata', () => {
    it('should include metadata in response', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/foods?start_date=2024-01-01&meal_type=Breakfast&limit=25',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)
      const data = await response.json()

      expect(data.meta).toMatchObject({
        start_date: '2024-01-01',
        end_date: null,
        meal_type_filter: 'Breakfast',
        limit: 25,
        format: 'json'
      })
    })
  })

  describe('Error Handling', () => {
    it('should return 401 when not authenticated', async () => {
      validateApiAuth.mockResolvedValue({ authenticated: false })

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods')
      const response = await GET(request)

      expect(response.status).toBe(401)
    })

    it('should handle database errors gracefully', async () => {
      sql.mockRejectedValue(new Error('Database connection failed'))

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Failed to analyze food data')
    })

    it('should handle empty results gracefully', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest('http://localhost/api/v1/caltrack/analytics/foods', {
        apiKey: 'test-api-key'
      })
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.food_analytics.top_foods_by_frequency).toHaveLength(0)
      expect(data.food_analytics.food_diversity.unique_foods).toBe(0)
    })

    it('should handle invalid limit parameter gracefully', async () => {
      sql
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ unique_foods: 0, total_entries: 0, diversity_ratio: 0 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])

      const request = createMockRequest(
        'http://localhost/api/v1/caltrack/analytics/foods?limit=invalid',
        { apiKey: 'test-api-key' }
      )
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.meta.limit).toBeNaN() // parseInt('invalid') returns NaN
    })
  })
})