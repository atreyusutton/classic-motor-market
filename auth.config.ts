import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      // Protect routes starting with /admin, /account, or /sell
      const isProtected = 
        nextUrl.pathname.startsWith('/admin') || 
        nextUrl.pathname.startsWith('/account') ||
        nextUrl.pathname.startsWith('/sell')
      
      if (isProtected) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      }
      return true
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
