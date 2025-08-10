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
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('/api/caltrack/exclude/[date]', () => {
  const { PATCH } = require('../exclude/[date]/route')
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockResolvedValue([])
  })

  describe('PATCH /api/caltrack/exclude/[date]', () => {
    it('should exclude a day from calculations', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ is_excluded: true })
      } as any
      
      const params = Promise.resolve({ date: '2023-01-01' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Day 2023-01-01 excluded from calculations')
      expect(mockSql).toHaveBeenCalledTimes(2) // updateDailyStats + update excluded status
    })

    it('should include a day in calculations', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ is_excluded: false })
      } as any
      
      const params = Promise.resolve({ date: '2023-01-01' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Day 2023-01-01 included in calculations')
    })

    it('should reject invalid date format', async () => {
      const request = {
        json: jest.fn().mockResolvedValue({ is_excluded: true })
      } as any
      
      const params = Promise.resolve({ date: 'invalid-date' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid date format. Use YYYY-MM-DD')
    })

    it('should handle database errors gracefully', async () => {
      mockSql.mockRejectedValue(new Error('Database error'))
      
      const request = {
        json: jest.fn().mockResolvedValue({ is_excluded: true })
      } as any
      
      const params = Promise.resolve({ date: '2023-01-01' })
      const response = await PATCH(request, { params })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Failed to update excluded status')
    })
  })
})