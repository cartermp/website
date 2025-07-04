import { NextRequest, NextResponse } from 'next/server'
import { generateApiKey } from '@/lib/api-keys'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'API key name is required' }, { status: 400 })
    }

    if (name.length > 100) {
      return NextResponse.json({ error: 'API key name must be 100 characters or less' }, { status: 400 })
    }

    // Use the allowed email from env since this is called from authenticated pages
    const userEmail = process.env.ALLOWED_EMAIL?.trim()
    if (!userEmail) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const apiKey = await generateApiKey(userEmail, name.trim())

    return NextResponse.json({
      success: true,
      api_key: {
        id: apiKey.id,
        name: apiKey.name,
        token: apiKey.token,
        created_at: apiKey.created_at
      }
    })
  } catch (error) {
    console.error('API key generation error:', error)
    return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 })
  }
}