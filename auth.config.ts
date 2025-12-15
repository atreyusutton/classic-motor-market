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
      
      if (!isProtected) return true
      // Only require login at the middleware layer; admin check happens in layouts/pages
      return isLoggedIn
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig
