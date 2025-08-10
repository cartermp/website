/**
 * @jest-environment node
 */

import { sql } from '@/lib/db'
import { NextResponse } from 'next/server'

// Mock the database
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}))

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: () => Promise.resolve(data),
      status: options?.status || 200
    }))
  }
}))

const mockSql = sql as jest.MockedFunction<typeof sql>

describe('/api/caltrack/daily-stats', () => {
  const { GET } = require('../daily-stats/route')
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/caltrack/daily-stats', () => {
    it('should return all daily stats', async () => {
      const mockStats = [
        {
          date: '2023-01-01',
          total_calories: 2500,
          breakfast_calories: 500,
          lunch_calories: 800,
          dinner_calories: 900,
          snacks_calories: 300,
          is_excluded: false
        },
        {
          date: '2023-01-02',
          total_calories: 2000,
          breakfast_calories: 400,
          lunch_calories: 600,
          dinner_calories: 700,
          snacks_calories: 300,
          is_excluded: true
        }
      ]
      
      mockSql.mockResolvedValue(mockStats)
      
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual(mockStats)
      expect(mockSql).toHaveBeenCalledTimes(1)
    })

    it('should handle database errors gracefully', async () => {
      mockSql.mockRejectedValue(new Error('Database error'))
      
      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to fetch daily stats')
    })
  })
})