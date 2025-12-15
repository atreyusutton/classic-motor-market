import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import Facebook from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.picture = user.image
        token.isAdmin = user.isAdmin
        token.username = user.username
        token.membershipStatus = user.membershipStatus
      }
      return token
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.username = token.username as string | undefined
        session.user.membershipStatus = token.membershipStatus as string | undefined
      }
      return session
    },
  },
  providers: [
    Google,
    Facebook,
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials
        
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
             where: { email: email as string } 
        });
        
        if (!user || !user.passwordHash) return null;

        const passwordsMatch = await bcrypt.compare(password as string, user.passwordHash);
        if (passwordsMatch) {
             return {
                 ...user,
                 id: user.id.toString()
             }
        }

        return null;
      },
    }),
  ],
})
