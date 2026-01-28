import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
    accessToken: string
  }

  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    name: string
    image?: string
    accessToken: string
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For demo purposes, using the same credentials as specified
        if (credentials?.email === "demo@example.com" && credentials?.password === "DemoRocks2025!") {
          return {
            id: "demo-user-id",
            email: "demo@example.com",
            name: "Demo User",
            image: undefined
          }
        }
        
        // In production, you would validate against your database here
        // const user = await validateUserCredentials(credentials.email, credentials.password)
        // if (user) return user
        
        return null
      }
    })
  ],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-out",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        // Generate a demo access token
        token.accessToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string | undefined
        session.accessToken = token.accessToken as string
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}