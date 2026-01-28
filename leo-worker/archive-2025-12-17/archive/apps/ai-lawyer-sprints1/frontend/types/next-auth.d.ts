import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string
      userType: string
      emailVerified: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    name: string
    userType: string
    emailVerified: boolean
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string
    userType: string
    emailVerified: boolean
  }
}