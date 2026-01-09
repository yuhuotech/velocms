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

// 兼容 Vercel Postgres / MySQL
let _db: any = null

class DatabaseClient {
  private connection: any = null

  async initialize(): Promise<void> {
    if (this.connection) return

    try {
      if (dbType === 'postgres' || dbType === 'vercel') {
        // 🟢 使用 Postgres
        if (!dbUrl && !process.env.POSTGRES_URL) {
          throw new Error('POSTGRES_URL or DATABASE_URL is required for Postgres')
        }
        const url = dbUrl || process.env.POSTGRES_URL
        this.connection = postgres(url!, { max: 1 })
        _db = drizzlePg(this.connection, { schema })
        console.log(`[Database] Connected to Postgres (${dbType})`)
      } else if (dbType === 'mysql') {
        // 🔵 使用 MySQL
        if (!dbUrl) {
          throw new Error('DATABASE_URL is required for MySQL')
        }
        this.connection = await mysql.createConnection(dbUrl)
        _db = drizzleMysql(this.connection, { schema, mode: 'default' })
        console.log(`[Database] Connected to MySQL`)
      } else {
        // 🟡 使用 SQLite (仅用于本地)
        const { drizzle } = await import('drizzle-orm/better-sqlite3')
        const Database = (await import('better-sqlite3')).default
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
      } else if (dbType === 'mysql') {
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
