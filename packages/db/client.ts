import { drizzle } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import Database from 'better-sqlite3'
import postgres from 'postgres'
import * as schema from './drizzle/schema'

// 数据库类型：'sqlite' | 'postgres' | 'vercel'
const dbType = process.env.DATABASE_TYPE || 'sqlite'

// SQLite 配置
const dbPath = process.env.DATABASE_PATH || './data/velocms.db'

// Postgres 配置
const pgUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

// 兼容 Vercel Postgres
let _db: any = null
let _connection: Database.Database | ReturnType<typeof postgres> | null = null

class DatabaseClient {
  private connection: any = null

  async initialize(): Promise<void> {
    if (this.connection) return

    try {
      if (dbType === 'postgres' || dbType === 'vercel') {
        // 🟢 使用 Postgres
        if (!pgUrl) {
          throw new Error('POSTGRES_URL or DATABASE_URL is required for Postgres')
        }

        this.connection = postgres(pgUrl, { max: 1 })
        _db = drizzlePg(this.connection, { schema })
        console.log(`[Database] Connected to Postgres (${dbType})`)
      } else {
        // 🟡 使用 SQLite (默认)
        this.connection = new Database(dbPath)
        _db = drizzle(this.connection, { schema })
        console.log(`[Database] Connected to SQLite at ${dbPath}`)
      }
    } catch (error) {
      console.error('[Database] Connection failed:', error)
      throw error
    }
  }

  async close(): Promise<void> {
    if (!this.connection) return

    try {
      if (dbType === 'postgres' || dbType === 'vercel') {
        await this.connection.end()
      } else {
        this.connection.close()
      }
      this.connection = null
      _db = null
      console.log('[Database] Connection closed')
    } catch (error) {
      console.error('[Database] Close failed:', error)
    }
  }

  getAdapter() {
    if (!_db) {
      throw new Error('Database not initialized. Call initialize() first.')
    }
    return _db
  }

  getType(): string {
    return dbType
  }
}

export const db = new DatabaseClient()
