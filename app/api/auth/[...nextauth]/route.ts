import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import clientPromise from "@/lib/mongodb"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const client = await clientPromise
        const db = client.db("auth-db")
        const usersCollection = db.collection("users")

        const user = await usersCollection.findOne({ 
          username: credentials.username 
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email || null,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = user.username
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.username = token.username
        session.user.id = token.sub as string
      }
      return session
    }
  }
})

export { handler as GET, handler as POST } 