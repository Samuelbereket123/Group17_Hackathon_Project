import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email?: string | null
    }
  }

  interface User {
    username: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
  }
} 