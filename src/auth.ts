import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { users } from '@/db/drizzle/schema'
import { db } from '@/db/client'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// 💡 这是一个特殊的数据库代理，专门给 NextAuth Adapter 使用
// 它在第一次被调用方法时，会抛出一个异常（如果未初始化），或者我们可以更优雅地处理
const adapterProxy = new Proxy({} as any, {
  get: (target, prop) => {
    // 允许 NextAuth 检查某些基础属性
    if (prop === 'constructor') return Object
    if (prop === 'then') return undefined
    
    return (...args: any[]) => {
      // 运行时：如果是调用数据库操作，返回一个能在运行时运行的实例
      const adapter = DrizzleAdapter(db.getAdapter())
      return (adapter as any)[prop](...args)
    }
  }
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  // @ts-ignore
  adapter: isBuildPhase ? undefined : adapterProxy,
  secret: process.env.AUTH_SECRET, // 💡 显式指定密钥
  trustHost: true,
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
          
          await db.initialize()
          const adapter = db.getAdapter()

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
      // 💡 在 session 回调中强制初始化数据库，确保后续操作有库可用
      await db.initialize()
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role
      }
      return session
    },
  },
})