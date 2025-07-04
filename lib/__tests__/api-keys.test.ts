import { sql } from '@/lib/db'
import { generateApiKey, validateApiKey, listApiKeys, revokeApiKey } from '../api-keys'

// Mock the sql tagged template literal
jest.mock('@/lib/db', () => ({
    sql: jest.fn().mockImplementation((strings: TemplateStringsArray, ...values: any[]) => {
        return Promise.resolve([]);
    })
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}))

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock_random_hex_string')
  }))
}))

// Create properly typed mocks after the modules are mocked
const mockSql = jest.mocked(sql);
const bcrypt = require('bcryptjs');
const mockHash = jest.mocked(bcrypt.hash);
const mockCompare = jest.mocked(bcrypt.compare);

describe('API Keys Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSql.mockClear()
  })

  describe('generateApiKey', () => {
    it('should generate an API key successfully', async () => {
      const mockResult = [{
        id: 1,
        user_email: 'test@example.com',
        name: 'Test Key',
        created_at: '2024-01-15T10:00:00Z',
        last_used_at: null,
        is_active: true
      }]

      mockHash.mockResolvedValue('hashed_token')
      mockSql.mockResolvedValue(mockResult)

      const result = await generateApiKey('test@example.com', 'Test Key')

      expect(result).toEqual({
        id: 1,
        user_email: 'test@example.com',
        name: 'Test Key',
        created_at: '2024-01-15T10:00:00Z',
        last_used_at: null,
        is_active: true,
        token: 'ct_mock_random_hex_string'
      })

      expect(mockHash).toHaveBeenCalledWith('ct_mock_random_hex_string', 12)
      expect(mockSql).toHaveBeenCalled()
    })

    it('should throw error when database insert fails', async () => {
      mockHash.mockResolvedValue('hashed_token')
      mockSql.mockResolvedValue([]) // Empty result

      await expect(generateApiKey('test@example.com', 'Test Key'))
        .rejects.toThrow('Failed to create API key')
    })

    it('should generate token with ct_ prefix', async () => {
      const mockResult = [{
        id: 1,
        user_email: 'test@example.com',
        name: 'Test Key',
        created_at: '2024-01-15T10:00:00Z',
        last_used_at: null,
        is_active: true
      }]

      mockHash.mockResolvedValue('hashed_token')
      mockSql.mockResolvedValue(mockResult)

      const result = await generateApiKey('test@example.com', 'Test Key')

      expect(result.token).toMatch(/^ct_/)
    })
  })

  describe('validateApiKey', () => {
    it('should validate a correct API key', async () => {
      const mockKeys = [
        {
          id: 1,
          key_hash: 'hashed_token',
          user_email: 'test@example.com'
        }
      ]

      mockSql.mockResolvedValueOnce(mockKeys) // First call for SELECT
      mockSql.mockResolvedValueOnce({ rowCount: 1 } as any) // Second call for UPDATE
      mockCompare.mockResolvedValue(true)

      const result = await validateApiKey('ct_valid_token')

      expect(result).toEqual({
        valid: true,
        userEmail: 'test@example.com'
      })

      expect(mockSql).toHaveBeenCalledTimes(2) // Once for SELECT, once for UPDATE
      expect(mockCompare).toHaveBeenCalledWith('ct_valid_token', 'hashed_token')
    })

    it('should reject API key without ct_ prefix', async () => {
      const result = await validateApiKey('invalid_token')

      expect(result).toEqual({ valid: false })
      expect(mockSql).not.toHaveBeenCalled()
      expect(mockCompare).not.toHaveBeenCalled()
    })

    it('should reject API key that does not match any hash', async () => {
      const mockKeys = [
        {
          id: 1,
          key_hash: 'hashed_token',
          user_email: 'test@example.com'
        }
      ]

      mockSql.mockResolvedValue(mockKeys)
      mockCompare.mockResolvedValue(false)

      const result = await validateApiKey('ct_invalid_token')

      expect(result).toEqual({ valid: false })
      expect(mockCompare).toHaveBeenCalledWith('ct_invalid_token', 'hashed_token')
    })

    it('should handle empty database result', async () => {
      mockSql.mockResolvedValue([])

      const result = await validateApiKey('ct_some_token')

      expect(result).toEqual({ valid: false })
      expect(mockCompare).not.toHaveBeenCalled()
    })

    it('should update last_used_at when API key is valid', async () => {
      const mockKeys = [
        {
          id: 1,
          key_hash: 'hashed_token',
          user_email: 'test@example.com'
        }
      ]

      mockSql.mockResolvedValueOnce(mockKeys) // First call for SELECT
      mockSql.mockResolvedValueOnce({ rowCount: 1 } as any) // Second call for UPDATE
      mockCompare.mockResolvedValue(true)

      await validateApiKey('ct_valid_token')

      expect(mockSql).toHaveBeenCalledTimes(2)
    })
  })

  describe('listApiKeys', () => {
    it('should list active API keys for user', async () => {
      const mockKeys = [
        {
          id: 1,
          user_email: 'test@example.com',
          name: 'Key 1',
          created_at: '2024-01-15T10:00:00Z',
          last_used_at: null,
          is_active: true
        },
        {
          id: 2,
          user_email: 'test@example.com',
          name: 'Key 2',
          created_at: '2024-01-14T08:00:00Z',
          last_used_at: '2024-01-16T09:00:00Z',
          is_active: true
        }
      ]

      mockSql.mockResolvedValue(mockKeys)

      const result = await listApiKeys('test@example.com')

      expect(result).toEqual(mockKeys)
      expect(mockSql).toHaveBeenCalled()
    })

    it('should return empty array when no keys exist', async () => {
      mockSql.mockResolvedValue([])

      const result = await listApiKeys('test@example.com')

      expect(result).toEqual([])
    })
  })

  describe('revokeApiKey', () => {
    it('should revoke an API key successfully', async () => {
      const mockResult = { rowCount: 1 } as any
      mockSql.mockResolvedValue(mockResult)

      const result = await revokeApiKey('test@example.com', 123)

      expect(result).toBe(true)
      expect(mockSql).toHaveBeenCalled()
    })

    it('should return false when no rows are updated', async () => {
      const mockResult = { rowCount: 0 } as any
      mockSql.mockResolvedValue(mockResult)

      const result = await revokeApiKey('test@example.com', 999)

      expect(result).toBe(false)
    })
  })
})