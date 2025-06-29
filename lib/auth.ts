import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server"
import Google from "next-auth/providers/google"
import type { AuthOptions } from "next-auth"

const authOptions: AuthOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        })
    ],
    callbacks: {
        async signIn({ user }) {
            const allowedEmail = process.env.ALLOWED_EMAIL?.trim();
            const userEmail = user.email?.trim();
            return allowedEmail === userEmail;
        }
    },
}

export async function validateApiAuth(request: NextRequest) {
    // Check for API key in headers
    const apiKey = request.headers.get('x-api-key')
    if (apiKey && apiKey === process.env.API_KEY) {
        return { authenticated: true, method: 'api-key' }
    }

    // Check for session-based auth
    try {
        const session = await getServerSession(authOptions)
        if (session?.user?.email === process.env.ALLOWED_EMAIL?.trim()) {
            return { authenticated: true, method: 'session' }
        }
    } catch (error) {
        // Session check failed
    }

    return { authenticated: false }
}

export function createAuthError() {
    return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
            status: 401, 
            headers: { 'Content-Type': 'application/json' } 
        }
    )
}