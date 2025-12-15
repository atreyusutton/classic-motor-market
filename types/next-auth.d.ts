import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isAdmin: boolean
      username?: string | null
      membershipStatus?: string
    } & DefaultSession["user"]
  }

  interface User {
    isAdmin: boolean
    username?: string | null
    membershipStatus?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isAdmin: boolean
    username?: string | null
    membershipStatus?: string
  }
}

