import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import type { User } from 'next-auth'

const authOptions = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_ID!,
            clientSecret: process.env.GOOGLE_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: User }) {
          const allowedEmail = process.env.ALLOWED_EMAIL?.trim();
          const userEmail = user.email?.trim();
          return allowedEmail === userEmail;
        }
    },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
