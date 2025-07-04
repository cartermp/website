import { NextRequest, NextResponse } from 'next/server'
import { revokeApiKey } from '@/lib/api-keys'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const keyId = parseInt(id)
    if (isNaN(keyId)) {
      return NextResponse.json({ error: 'Invalid API key ID' }, { status: 400 })
    }

    // Use the allowed email from env since this is called from authenticated pages
    const userEmail = process.env.ALLOWED_EMAIL?.trim()
    if (!userEmail) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const success = await revokeApiKey(userEmail, keyId)

    if (!success) {
      return NextResponse.json({ error: 'API key not found or already revoked' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'API key revoked successfully'
    })
  } catch (error) {
    console.error('API key revocation error:', error)
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 })
  }
}