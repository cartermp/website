import { validateApiAuth, createAuthError } from '@/lib/auth'
import { createMockRequest, mockEnvVars } from './test-utils'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

describe('API Authentication', () => {
  mockEnvVars({
    API_KEY: 'test-api-key',
    ALLOWED_EMAIL: 'test@example.com'
  })

  describe('validateApiAuth', () => {
    it('should authenticate with valid API key', async () => {
      const request = createMockRequest('http://localhost/api/test', {
        apiKey: 'test-api-key'
      })

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(true)
      expect(result.method).toBe('api-key')
    })

    it('should reject invalid API key', async () => {
      const request = createMockRequest('http://localhost/api/test', {
        apiKey: 'invalid-key'
      })

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(false)
    })

    it('should reject missing API key when no session', async () => {
      const request = createMockRequest('http://localhost/api/test')

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(false)
    })

    it('should authenticate with valid session', async () => {
      const { getServerSession } = require('next-auth/next')
      getServerSession.mockResolvedValue({
        user: { email: 'test@example.com' }
      })

      const request = createMockRequest('http://localhost/api/test')

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(true)
      expect(result.method).toBe('session')
    })

    it('should reject session with wrong email', async () => {
      const { getServerSession } = require('next-auth/next')
      getServerSession.mockResolvedValue({
        user: { email: 'wrong@example.com' }
      })

      const request = createMockRequest('http://localhost/api/test')

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(false)
    })

    it('should handle session errors gracefully', async () => {
      const { getServerSession } = require('next-auth/next')
      getServerSession.mockRejectedValue(new Error('Session error'))

      const request = createMockRequest('http://localhost/api/test')

      const result = await validateApiAuth(request)
      
      expect(result.authenticated).toBe(false)
    })
  })

  describe('createAuthError', () => {
    it('should return 401 error response', () => {
      const response = createAuthError()
      
      expect(response.status).toBe(401)
      expect(response.headers.get('Content-Type')).toBe('application/json')
    })

    it('should return proper error message', async () => {
      const response = createAuthError()
      const body = await response.json()
      
      expect(body.error).toBe('Unauthorized')
    })
  })
})