import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { users } from '@/db/drizzle/schema'
import { db } from '@/db/client' // 💡 使用统一的 db 客户端
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// 💡 改进：适配器也需要延迟初始化，或者使用 Mock
const getAdapter = () => {
  try {
    // 如果是构建阶段，返回一个哑适配器
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return undefined
    }
    return db.getAdapter()
  } catch (e) {
    return undefined
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-ignore
  adapter: DrizzleAdapter(db.getAdapter()),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { username, password } = loginSchema.parse(credentials)
          
          // 💡 确保数据库已初始化
          await db.initialize()
          const adapter = db.getAdapter()

          // Support login with username
          const userResults = await adapter
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1)

          const user = userResults[0]

          if (!user || !user.passwordHash) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.passwordHash)

          if (!isValid) {
            return null
          }

          return {
            id: String(user.id),
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
})