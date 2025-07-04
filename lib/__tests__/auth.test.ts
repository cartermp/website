import { validateApiAuth } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { validateApiKey } from '@/lib/api-keys'

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn()
}))

// Mock api-keys module
jest.mock('@/lib/api-keys', () => ({
  validateApiKey: jest.fn()
}))

describe('validateApiAuth', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  const mockValidateApiKey = validateApiKey as jest.MockedFunction<typeof validateApiKey>

  beforeEach(() => {
    jest.clearAllMocks()
    // Set up environment variables
    process.env.API_KEY = 'legacy-api-key'
    process.env.ALLOWED_EMAIL = 'test@example.com'
  })

  afterEach(() => {
    delete process.env.API_KEY
    delete process.env.ALLOWED_EMAIL
  })

  describe('API Key Authentication', () => {
    it('should authenticate with legacy API key', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('legacy-api-key')
        }
      } as any

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'api-key'
      })
      expect(mockValidateApiKey).not.toHaveBeenCalled()
      expect(mockGetServerSession).not.toHaveBeenCalled()
    })

    it('should authenticate with database API key', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('ct_database_key')
        }
      } as any

      mockValidateApiKey.mockResolvedValue({
        valid: true,
        userEmail: 'test@example.com'
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'api-key',
        userEmail: 'test@example.com'
      })
      expect(mockValidateApiKey).toHaveBeenCalledWith('ct_database_key')
      expect(mockGetServerSession).not.toHaveBeenCalled()
    })

    it('should reject invalid database API key', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('ct_invalid_key')
        }
      } as any

      mockValidateApiKey.mockResolvedValue({
        valid: false
      })

      // Mock session check to return unauthenticated
      mockGetServerSession.mockResolvedValue(null)

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
      expect(mockValidateApiKey).toHaveBeenCalledWith('ct_invalid_key')
    })

    it('should check both legacy and database keys', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('some-other-key')
        }
      } as any

      mockValidateApiKey.mockResolvedValue({
        valid: false
      })
      mockGetServerSession.mockResolvedValue(null)

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
      expect(mockValidateApiKey).toHaveBeenCalledWith('some-other-key')
    })
  })

  describe('Session Authentication', () => {
    it('should authenticate with valid session', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null) // No API key
        }
      } as any

      mockGetServerSession.mockResolvedValue({
        user: {
          email: 'test@example.com'
        }
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'session',
        userEmail: 'test@example.com'
      })
    })

    it('should reject session with wrong email', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      mockGetServerSession.mockResolvedValue({
        user: {
          email: 'wrong@example.com'
        }
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
    })

    it('should reject session without email', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      mockGetServerSession.mockResolvedValue({
        user: {}
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
    })

    it('should handle session check errors', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      mockGetServerSession.mockRejectedValue(new Error('Session error'))

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
    })
  })

  describe('No Authentication', () => {
    it('should reject when no API key and no session', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      mockGetServerSession.mockResolvedValue(null)

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
    })
  })

  describe('Priority Testing', () => {
    it('should prioritize API key over session', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('legacy-api-key')
        }
      } as any

      // Even if session would be valid, API key should take precedence
      mockGetServerSession.mockResolvedValue({
        user: {
          email: 'test@example.com'
        }
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'api-key'
      })
      expect(mockGetServerSession).not.toHaveBeenCalled()
    })

    it('should prioritize legacy API key over database API key', async () => {
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('legacy-api-key')
        }
      } as any

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'api-key'
      })
      expect(mockValidateApiKey).not.toHaveBeenCalled()
    })
  })

  describe('Environment Variable Handling', () => {
    it('should handle missing ALLOWED_EMAIL', async () => {
      delete process.env.ALLOWED_EMAIL

      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      mockGetServerSession.mockResolvedValue({
        user: {
          email: 'test@example.com'
        }
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: false
      })
    })

    it('should handle missing legacy API_KEY', async () => {
      delete process.env.API_KEY

      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue('some-key')
        }
      } as any

      mockValidateApiKey.mockResolvedValue({
        valid: true,
        userEmail: 'test@example.com'
      })

      const result = await validateApiAuth(mockRequest)

      expect(result).toEqual({
        authenticated: true,
        method: 'api-key',
        userEmail: 'test@example.com'
      })
    })
  })
})