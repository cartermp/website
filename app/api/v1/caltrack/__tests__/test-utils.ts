import { NextRequest } from 'next/server'

// Mock SQL function for testing
export const createMockSql = (mockResults: any[] = []) => {
  const mockSql = jest.fn().mockResolvedValue(mockResults)
  // Support both function call and template literal syntax
  Object.assign(mockSql, mockSql)
  return mockSql
}

// Create a mock request with authentication headers
export const createMockRequest = (
  url: string,
  options: {
    apiKey?: string
    method?: string
    headers?: Record<string, string>
  } = {}
) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (options.apiKey) {
    headers['x-api-key'] = options.apiKey
  }

  // Create mock request that matches NextRequest interface
  const mockRequest = {
    url,
    method: options.method || 'GET',
    headers: {
      get: jest.fn((key: string) => headers[key.toLowerCase()] || null),
      set: jest.fn((key: string, value: string) => { headers[key.toLowerCase()] = value }),
      has: jest.fn((key: string) => key.toLowerCase() in headers),
      entries: jest.fn(() => Object.entries(headers)),
    },
    // Mock URL parsing
    nextUrl: {
      searchParams: new URLSearchParams(url.includes('?') ? url.split('?')[1] : '')
    }
  }

  return mockRequest as unknown as NextRequest
}

// Mock environment variables
export const mockEnvVars = (vars: Record<string, string>) => {
  const originalEnv = process.env
  beforeEach(() => {
    process.env = { ...originalEnv, ...vars }
  })
  afterEach(() => {
    process.env = originalEnv
  })
}

// Sample test data
export const sampleCalorieEntries = [
  {
    date: '2024-01-15',
    meal_type: 'Breakfast',
    meal_name: 'Oatmeal with berries',
    calories: 350,
    timestamp: 1705363200
  },
  {
    date: '2024-01-15',
    meal_type: 'Lunch',
    meal_name: 'Chicken salad',
    calories: 450,
    timestamp: 1705380000
  },
  {
    date: '2024-01-15',
    meal_type: 'Dinner',
    meal_name: 'Salmon with rice',
    calories: 650,
    timestamp: 1705406400
  }
]

export const sampleDailyStats = [
  {
    date: '2024-01-15',
    total_calories: 1450,
    breakfast_calories: 350,
    lunch_calories: 450,
    dinner_calories: 650,
    snacks_calories: 0,
    updated_at: '2024-01-15T20:30:00Z',
    timestamp: 1705363200
  }
]

export const sampleSummaryStats = [
  {
    total_days: 30,
    avg_daily_calories: 2100.50,
    max_daily_calories: 2800,
    min_daily_calories: 1650,
    stddev_daily_calories: 245.30
  }
]

export const sampleMealTypeStats = [
  {
    meal_type: 'Dinner',
    entry_count: 25,
    avg_calories: 750.50,
    total_calories: 18762,
    max_calories: 1200,
    min_calories: 400
  },
  {
    meal_type: 'Lunch',
    entry_count: 24,
    avg_calories: 550.25,
    total_calories: 13206,
    max_calories: 800,
    min_calories: 300
  }
]

export const sampleTopFoods = [
  {
    meal_name: 'Chicken breast',
    frequency: 15,
    avg_calories: 300,
    total_calories: 4500
  },
  {
    meal_name: 'Rice',
    frequency: 12,
    avg_calories: 200,
    total_calories: 2400
  }
]

// Mock database connection
export const mockDatabase = () => {
  beforeEach(() => {
    jest.doMock('@/lib/db', () => ({
      sql: createMockSql()
    }))
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })
}