import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { DynamoDBAdapter } from "@auth/dynamodb-adapter"
import { DynamoDB } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb"
import bcrypt from "bcryptjs"

// Create DynamoDB client
const client = DynamoDBDocument.from(
  new DynamoDB({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION || "us-east-1",
  }),
  {
    marshallOptions: {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
    },
  }
)

export const authOptions: NextAuthOptions = {
  // Configure DynamoDB adapter
  adapter: DynamoDBAdapter(client, {
    tableName: process.env.DYNAMODB_AUTH_TABLE_NAME || "better-auth-table",
  }),
  
  // Session strategy - use JWT for stateless auth
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  
  // Configure credentials provider
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Check if auth bypass is enabled
          if (process.env.NEXT_PUBLIC_AUTH_BYPASS === "true") {
            console.log("[NextAuth] Auth bypass enabled, returning mock user")
            return {
              id: "demo_user_123",
              email: "demo@example.com",
              name: "Demo User",
              userType: "tenant",
              emailVerified: true,
            }
          }

          // Query user from DynamoDB
          const result = await client.query({
            TableName: process.env.DYNAMODB_TABLE_NAME || "app-main-table",
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
              ":email": credentials.email,
            },
            Limit: 1,
          })

          const user = result.Items?.[0]

          if (!user || !user.hashed_password) {
            console.log("[NextAuth] User not found or no password")
            return null
          }

          // Verify password
          const isValid = await bcrypt.compare(credentials.password, user.hashed_password)
          
          if (!isValid) {
            console.log("[NextAuth] Invalid password")
            return null
          }

          // Return user object
          return {
            id: user.id || user.PK?.replace("USER#", ""),
            email: user.email,
            name: user.name,
            userType: user.user_type || user.userType || "tenant",
            emailVerified: user.email_verified || user.emailVerified || false,
          }
        } catch (error) {
          console.error("[NextAuth] Error during authentication:", error)
          return null
        }
      }
    })
  ],
  
  // Callbacks
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.userType = user.userType
        token.emailVerified = user.emailVerified
      }
      return token
    },
    
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.userType = token.userType as string
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    },
  },
  
  // Pages
  pages: {
    signIn: "/sign-in",
    signOut: "/",
    error: "/auth-error",
  },
  
  // Enable debug in development
  debug: process.env.NODE_ENV === "development",
  
  // Secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET || process.env.BETTER_AUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }