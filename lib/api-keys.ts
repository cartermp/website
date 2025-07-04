import { sql } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

export interface ApiKey {
  id: number
  user_email: string
  name: string
  created_at: string
  last_used_at: string | null
  is_active: boolean
}

export interface ApiKeyWithToken extends ApiKey {
  token: string
}

export async function generateApiKey(userEmail: string, name: string): Promise<ApiKeyWithToken> {
  // Generate a secure random API key
  const token = `ct_${randomBytes(32).toString('hex')}`
  
  // Hash the token for storage
  const keyHash = await bcrypt.hash(token, 12)
  
  // Insert into database
  const result = await sql`
    INSERT INTO api_keys (user_email, key_hash, name)
    VALUES (${userEmail}, ${keyHash}, ${name})
    RETURNING id, user_email, name, created_at, last_used_at, is_active
  `
  
  if (result.length === 0) {
    throw new Error('Failed to create API key')
  }
  
  return {
    ...(result[0] as ApiKey),
    token
  }
}

export async function validateApiKey(token: string): Promise<{ valid: boolean; userEmail?: string }> {
  if (!token.startsWith('ct_')) {
    return { valid: false }
  }
  
  // Get all active API keys
  const keys = await sql`
    SELECT key_hash, user_email, id
    FROM api_keys 
    WHERE is_active = TRUE
  `
  
  // Check each hash (constant-time comparison via bcrypt)
  for (const key of keys) {
    const isValid = await bcrypt.compare(token, key.key_hash)
    if (isValid) {
      // Update last_used_at
      await sql`
        UPDATE api_keys 
        SET last_used_at = CURRENT_TIMESTAMP 
        WHERE id = ${key.id}
      `
      
      return { valid: true, userEmail: key.user_email }
    }
  }
  
  return { valid: false }
}

export async function listApiKeys(userEmail: string): Promise<ApiKey[]> {
  const result = await sql`
    SELECT id, user_email, name, created_at, last_used_at, is_active
    FROM api_keys
    WHERE user_email = ${userEmail} AND is_active = TRUE
    ORDER BY created_at DESC
  `
  
  return result as ApiKey[]
}

export async function revokeApiKey(userEmail: string, keyId: number): Promise<boolean> {
  const result = await sql`
    UPDATE api_keys
    SET is_active = FALSE
    WHERE id = ${keyId} AND user_email = ${userEmail} AND is_active = TRUE
  `
  
  console.log('Revoke result:', result) // Debug log
  return result.count > 0
}