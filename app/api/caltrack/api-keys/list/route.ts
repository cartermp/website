import { NextResponse } from 'next/server'
import { listApiKeys } from '@/lib/api-keys'

export async function GET() {
  try {
    // Use the allowed email from env since this is called from authenticated pages
    const userEmail = process.env.ALLOWED_EMAIL?.trim()
    if (!userEmail) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const apiKeys = await listApiKeys(userEmail)

    return NextResponse.json({
      success: true,
      api_keys: apiKeys.map(key => ({
        id: key.id,
        name: key.name,
        created_at: key.created_at,
        last_used_at: key.last_used_at,
        is_active: key.is_active
      }))
    })
  } catch (error) {
    console.error('API key listing error:', error)
    return NextResponse.json({ error: 'Failed to list API keys' }, { status: 500 })
  }
}