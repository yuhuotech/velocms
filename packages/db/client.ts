import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2'
import postgres from 'postgres'
import mysql from 'mysql2/promise'
import * as schema from './drizzle/schema'

// 💡 智能检测数据库类型
const getDbType = () => {
  if (process.env.POSTGRES_URL || process.env.DATABASE_URL?.startsWith('postgres')) return 'vercel'
  if (process.env.DATABASE_URL?.startsWith('mysql')) return 'mysql'
  return process.env.DATABASE_TYPE || 'sqlite'
}

const dbType = getDbType()
const dbPath = process.env.DATABASE_PATH || './data/velocms.db'
const dbUrl = process.env.DATABASE_URL

let _db: any = null

class DatabaseClient {
  private connection: any = null

  async initialize(): Promise<void> {
    if (this.connection || _db) return
    
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('[Database] Skip initialization during build phase')
      return
    }

    try {
      if (dbType === 'postgres' || dbType === 'vercel') {
        const url = dbUrl || process.env.POSTGRES_URL
        if (!url) throw new Error('POSTGRES_URL is required')
        this.connection = postgres(url, { max: 1 })
        _db = drizzlePg(this.connection, { schema })
        console.log(`[Database] Connected to Postgres`)
      } else if (dbType === 'mysql') {
        const url = dbUrl
        if (!url) throw new Error('DATABASE_URL is required for MySQL')
        this.connection = await mysql.createConnection(url)
        _db = drizzleMysql(this.connection, { schema, mode: 'default' })
        console.log(`[Database] Connected to MySQL`)
      } else {
        const fs = await import('fs/promises')
        const path = await import('path')
        const { drizzle } = await import('drizzle-orm/better-sqlite3')
        const Database = (await import('better-sqlite3')).default
        
        const dir = path.dirname(dbPath)
        try { await fs.mkdir(dir, { recursive: true }) } catch (e) {}

        this.connection = new Database(dbPath)
        _db = drizzle(this.connection, { schema })
      }
    } catch (error) {
      console.error('[Database] Connection failed:', error)
      if (process.env.NEXT_PHASE === 'phase-production-build') return
      throw error
    }
  }

  getAdapter() {
    if (!_db) {
      if (process.env.NEXT_PHASE === 'phase-production-build') {
        // 🚀 创建一个可以无限链式调用的递归 Proxy
        const createMock = (): any => {
          const mock: any = new Proxy(() => mock, {
            get: (target, prop) => {
              // 模拟异步返回
              if (prop === 'then') {
                return (resolve: any) => resolve([])
              }
              // 兼容 Drizzle 的一些特殊属性检查
              if (prop === 'constructor') return Object
              return createMock()
            }
          })
          return mock
        }
        return createMock()
      }
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return _db
  }

  getType(): string {
    return dbType
  }
}

export const db = new DatabaseClient()