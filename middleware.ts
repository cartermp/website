import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Allow public access to shared pages
        if (req.nextUrl.pathname.startsWith('/caltrack/share/')) {
          return true
        }
        // Require authentication for all other caltrack routes
        return !!token
      }
    }
  }
)

export const config = {
  matcher: ["/caltrack/:path*"]
}