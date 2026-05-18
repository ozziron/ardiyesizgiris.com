import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db/prisma"
import bcryptjs from "bcryptjs"

export const { auth, signIn, signOut, handlers } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // NextAuth v5 best practice: return null on any auth failure rather
        // than throwing an Error. Throwing surfaces a generic "Configuration"
        // error to the client; returning null lets v5 emit the standard
        // "CredentialsSignin" error which the client form can match on.
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isPasswordValid = await bcryptjs.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isPasswordValid) {
          return null
        }

        // Block login if email has not been verified yet.
        // We encode this as a special error code the client can detect.
        if (!user.emailVerified) {
          // NextAuth v5: to pass a structured error back to the form,
          // throw a special marker error. The signIn callback can't surface
          // custom codes, so we encode "email_not_verified" in the throw message.
          throw new Error("EMAIL_NOT_VERIFIED")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          membershipType: user.membershipType,
          subscriptionActive: user.subscriptionActive,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role ?? undefined
        token.membershipType = user.membershipType ?? undefined
        token.subscriptionActive = user.subscriptionActive ?? false
      }
      // Refresh membership/subscription on session update trigger (post-checkout)
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { membershipType: true, subscriptionActive: true },
        })
        if (fresh) {
          token.membershipType = fresh.membershipType
          token.subscriptionActive = fresh.subscriptionActive
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role
        session.user.membershipType = token.membershipType
        session.user.subscriptionActive = token.subscriptionActive ?? false
      }
      return session
    },
  },
  pages: {
    signIn: "/giris",
    newUser: "/kayit",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
