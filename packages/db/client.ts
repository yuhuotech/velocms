import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2'
import postgres from 'postgres'
import mysql from 'mysql2/promise'
import * as schema from './drizzle/schema'

// 数据库类型：'sqlite' | 'postgres' | 'vercel' | 'mysql'
const dbType = process.env.DATABASE_TYPE || 'sqlite'

// SQLite 配置
const dbPath = process.env.DATABASE_PATH || './data/velocms.db'

// Postgres/MySQL 配置
const dbUrl = process.env.DATABASE_URL

// 缓存实例
let _db: any = null

class DatabaseClient {
  private connection: any = null

  async initialize(): Promise<void> {
    if (this.connection || _db) return
    
    // 🚀 构建阶段保护：在 Vercel Build 时完全不初始化数据库
    if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL_ENV === 'preview') {
      console.log('[Database] Build phase detected, using mock adapter')
      _db = {
        query: () => ({ findMany: () => [], findFirst: () => null }),
        insert: () => ({ values: () => ({ returning: () => [] }) }),
        update: () => ({ set: () => ({ where: () => [] }) }),
        delete: () => ({ where: () => [] }),
      } as any
      return
    }

    try {
      if (dbType === 'postgres' || dbType === 'vercel') {
        const url = dbUrl || process.env.POSTGRES_URL
        if (!url) {
          throw new Error('POSTGRES_URL or DATABASE_URL is required for Postgres')
        }
        this.connection = postgres(url, { max: 1 })
        _db = drizzlePg(this.connection, { schema })
        console.log(`[Database] Connected to Postgres (${dbType})`)
      } else if (dbType === 'mysql') {
        if (!dbUrl) {
          throw new Error('DATABASE_URL is required for MySQL')
        }
        this.connection = await mysql.createConnection(dbUrl)
        _db = drizzleMysql(this.connection, { schema, mode: 'default' })
        console.log(`[Database] Connected to MySQL`)
      } else {
        // 🟡 只有在明确需要 SQLite 的运行时才加载这些包
        console.log(`[Database] Initializing SQLite at ${dbPath}`)
        const fs = await import('fs/promises')
        const path = await import('path')
        const { drizzle } = await import('drizzle-orm/better-sqlite3')
        const Database = (await import('better-sqlite3')).default
        
        const dir = path.dirname(dbPath)
        try {
          await fs.mkdir(dir, { recursive: true })
        } catch (e) {}

        this.connection = new Database(dbPath)
        _db = drizzle(this.connection, { schema })
        console.log(`[Database] Connected to SQLite`)
      }
    } catch (error) {
      console.error('[Database] Connection failed:', error)
      // 如果是构建环境，即使失败也不要中断构建
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        return
      }
      throw error
    }
  }

  async close(): Promise<void> {
    if (!this.connection) return
    try {
      if (typeof this.connection.end === 'function') {
        await this.connection.end()
      } else if (typeof this.connection.close === 'function') {
        this.connection.close()
      }
      this.connection = null
      _db = null
    } catch (error) {
      console.error('[Database] Close failed:', error)
    }
  }

  getAdapter() {
    if (!_db) {
      // 如果还没初始化，返回一个代理对象，防止调用崩溃
      return new Proxy({} as any, {
        get: (target, prop) => {
          if (prop === 'then') return undefined
          return () => {
            console.warn(`[Database] Warning: Accessing db.${String(prop)} before initialization`)
            return {
              where: () => [],
              values: () => ({ returning: () => [] }),
              set: () => ({ where: () => [] }),
            }
          }
        }
      })
    }
    return _db
  }

  getType(): string {
    return dbType
  }
}

export const db = new DatabaseClient()