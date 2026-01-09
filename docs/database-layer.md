# VeloCMS 数据存储抽象层设计

## 概述

VeloCMS 数据存储抽象层提供统一的数据库访问接口，支持多种存储后端（Vercel Postgres、SQLite），实现开发环境与生产环境的无缝切换。

**设计目标**：
- ✅ 多后端支持（Postgres、SQLite）
- ✅ 统一的 API 接口
- ✅ 类型安全（TypeScript + Drizzle ORM）
- ✅ 连接池管理
- ✅ 事务支持
- ✅ 查询优化
- ✅ 缓存集成
- ✅ 迁移管理

---

## 架构设计

### 分层架构

```
┌─────────────────────────────────────────┐
│     Application Layer (Services)       │
│  (ContentService, UserService, etc.)    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Repository Layer                │
│  (PostRepository, UserRepository...)    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      ORM Abstraction (Drizzle)          │
│     (Schema, Migrations, Queries)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│     Adapter Layer                       │
│   (VercelAdapter, SQLiteAdapter)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Storage Layer                     │
│  (Vercel Postgres + KV / SQLite)        │
└─────────────────────────────────────────┘
```

---

## 目录结构

```
packages/db/
├── drizzle/
│   ├── schema/
│   │   ├── users.ts
│   │   ├── posts.ts
│   │   ├── videos.ts
│   │   ├── tags.ts
│   │   ├── themes.ts
│   │   ├── settings.ts
│   │   ├── assets.ts
│   │   └── index.ts
│   ├── migrations/            # 迁移文件
│   └── config.ts              # Drizzle 配置
│
├── adapter/                   # 数据库适配器
│   ├── vercel.ts              # Vercel Postgres + KV
│   ├── sqlite.ts              # SQLite
│   └── factory.ts             # 适配器工厂
│
├── repositories/              # 数据访问层
│   ├── base.repository.ts
│   ├── user.repository.ts
│   ├── post.repository.ts
│   ├── video.repository.ts
│   ├── tag.repository.ts
│   ├── theme.repository.ts
│   └── index.ts
│
├── cache/                     # 缓存层
│   ├── cache.adapter.ts
│   ├── vercel-kv.ts
│   ├── memory.ts
│   └── index.ts
│
├── client.ts                  # 统一数据库客户端
├── types.ts                   # 类型定义
└── index.ts
```

---

## 数据库 Schema

### 用户表（users）

```typescript
// packages/db/drizzle/schema/users.ts
import { pgTable, serial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  avatar: varchar('avatar', { length: 500 }),
  bio: varchar('bio', { length: 1000 }),
  website: varchar('website', { length: 500 }),
  role: varchar('role', { length: 50 }).notNull().default('user'), // 'admin', 'editor', 'user'
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

### 文章表（posts）

```typescript
// packages/db/drizzle/schema/posts.ts
import { pgTable, serial, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: varchar('excerpt', { length: 1000 }),
  coverImage: varchar('cover_image', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('draft'), // 'draft', 'published', 'archived'
  publishedAt: timestamp('published_at'),
  readingTime: serial('reading_time'), // 分钟
  viewCount: serial('view_count').notNull().default(0),
  metadata: jsonb('metadata').$type<{
    seoTitle?: string
    seoDescription?: string
    ogImage?: string
    custom?: Record<string, any>
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('posts_slug_idx').on(table.slug),
  userIdIdx: index('posts_user_id_idx').on(table.userId),
  statusIdx: index('posts_status_idx').on(table.status),
  publishedAtIdx: index('posts_published_at_idx').on(table.publishedAt),
}))

export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
```

### 视频表（videos）

```typescript
// packages/db/drizzle/schema/videos.ts
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(), // 'youtube', 'bilibili', 'vimeo'
  videoId: varchar('video_id', { length: 255 }).notNull(), // 平台视频 ID
  duration: serial('duration'), // 秒
  thumbnail: varchar('thumbnail', { length: 500 }),
  description: text('description'),
  metadata: jsonb('metadata').$type<{
    views?: number
    likes?: number
    platformData?: any
  }>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
```

### 标签表（tags）

```typescript
// packages/db/drizzle/schema/tags.ts
import { pgTable, serial, varchar, timestamp, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: varchar('description', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  slugIdx: index('tags_slug_idx').on(table.slug),
}))

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert

// 文章-标签关联表
export const postTags = pgTable('post_tags', {
  postId: serial('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: serial('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: index('post_tags_pk').on(table.postId, table.tagId),
}))

export type PostTag = typeof postTags.$inferSelect
export type NewPostTag = typeof postTags.$inferInsert
```

### 主题表（themes）

```typescript
// packages/db/drizzle/schema/themes.ts
import { pgTable, serial, varchar, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  version: varchar('version', { length: 50 }).notNull(),
  author: varchar('author', { length: 255 }),
  description: text('description'),
  config: jsonb('config').$type<ThemeConfig>(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type Theme = typeof themes.$inferSelect
export type NewTheme = typeof themes.$inferInsert

// 用户主题设置
export const userSettings = pgTable('user_settings', {
  userId: serial('user_id').primaryKey(),
  themeId: serial('theme_id').references(() => themes.id),
  customConfig: jsonb('custom_config').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export type UserSettings = typeof userSettings.$inferSelect
export type NewUserSettings = typeof userSettings.$inferInsert
```

### 资源表（assets）

```typescript
// packages/db/drizzle/schema/assets.ts
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalName: varchar('original_name', { length: 500 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  size: serial('size').notNull(), // 字节
  width: serial('width'),
  height: serial('height'),
  alt: varchar('alt', { length: 500 }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export type Asset = typeof assets.$inferSelect
export type NewAsset = typeof assets.$inferInsert
```

### 代码片段表（snippets）

```typescript
// packages/db/drizzle/schema/snippets.ts
import { pgTable, serial, varchar, text, timestamp, index } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'
import { users } from './users'

export const snippets = pgTable('snippets', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 500 }).notNull(),
  code: text('code').notNull(),
  language: varchar('language', { length: 50 }).notNull(), // 'javascript', 'python', etc.
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('snippets_user_id_idx').on(table.userId),
}))

export type Snippet = typeof snippets.$inferSelect
export type NewSnippet = typeof snippets.$inferInsert

// 文章-代码片段关联表
export const postSnippets = pgTable('post_snippets', {
  postId: serial('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  snippetId: serial('snippet_id').notNull().references(() => snippets.id, { onDelete: 'cascade' }),
}, (table) => ({
  pk: index('post_snippets_pk').on(table.postId, table.snippetId),
}))
```

---

## 适配器实现

### 适配器接口

```typescript
// packages/db/types.ts
import { SQL } from 'drizzle-orm'

export interface DatabaseAdapter {
  connect(): Promise<void>
  disconnect(): Promise<void>
  query<T>(sql: string, params?: any[]): Promise<T[]>
  execute(sql: string, params?: any[]): Promise<void>
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>
  healthCheck(): Promise<boolean>
}

export interface Transaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>
  execute(sql: string, params?: any[]): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}
```

### Vercel Adapter

```typescript
// packages/db/adapter/vercel.ts
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from '../drizzle/schema'
import { DatabaseAdapter } from '../types'

export class VercelAdapter implements DatabaseAdapter {
  private db: ReturnType<typeof drizzle>
  private kv: KVNamespace

  constructor() {
    this.db = drizzle(sql, { schema })
    this.kv = createClient()
  }

  async connect(): Promise<void> {
    // Vercel Postgres 自动连接
    // KV 连接
    this.kv = await createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }

  async disconnect(): Promise<void> {
    // Vercel 连接由运行时管理
  }

  async query<T>(sqlString: string, params: any[] = []): Promise<T[]> {
    const result = await sql.query(sqlString, params)
    return result.rows as T[]
  }

  async execute(sqlString: string, params: any[] = []): Promise<void> {
    await sql.query(sqlString, params)
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.db.transaction(callback)
  }

  async healthCheck(): Promise<boolean> {
    try {
      await sql`SELECT 1`
      return true
    } catch (error) {
      return false
    }
  }

  getDrizzleClient() {
    return this.db
  }

  getKVClient() {
    return this.kv
  }
}
```

### SQLite Adapter

```typescript
// packages/db/adapter/sqlite.ts
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../drizzle/schema'
import { DatabaseAdapter, Transaction } from '../types'

export class SQLiteAdapter implements DatabaseAdapter {
  private db: ReturnType<typeof drizzle>
  private connection: Database.Database
  private txStack: Transaction[] = []

  constructor(dbPath: string) {
    this.connection = new Database(dbPath)
    this.connection.pragma('journal_mode = WAL')
    this.db = drizzle(this.connection, { schema })
  }

  async connect(): Promise<void> {
    // SQLite 在构造函数中已连接
  }

  async disconnect(): Promise<void> {
    this.connection.close()
  }

  async query<T>(sqlString: string, params: any[] = []): Promise<T[]> {
    const stmt = this.connection.prepare(sqlString)
    const result = stmt.all(...params)
    return result as T[]
  }

  async execute(sqlString: string, params: any[] = []): Promise<void> {
    const stmt = this.connection.prepare(sqlString)
    stmt.run(...params)
  }

  async transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T> {
    const tx = this.connection.transaction(callback)
    return tx()
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = this.connection.prepare('SELECT 1').get()
      return result !== undefined
    } catch (error) {
      return false
    }
  }

  getDrizzleClient() {
    return this.db
  }

  getConnection() {
    return this.connection
  }
}
```

### 适配器工厂

```typescript
// packages/db/adapter/factory.ts
import { VercelAdapter } from './vercel'
import { SQLiteAdapter } from './sqlite'
import { DatabaseAdapter } from '../types'

export function createAdapter(): DatabaseAdapter {
  const dbType = process.env.DATABASE_TYPE || 'sqlite'

  if (dbType === 'vercel') {
    return new VercelAdapter()
  } else if (dbType === 'sqlite') {
    const dbPath = process.env.DATABASE_PATH || './data/velocms.db'
    return new SQLiteAdapter(dbPath)
  } else {
    throw new Error(`Unsupported database type: ${dbType}`)
  }
}
```

---

## 统一数据库客户端

```typescript
// packages/db/client.ts
import { createAdapter } from './adapter/factory'
import * as schema from './drizzle/schema'
import { cache } from './cache'

class DatabaseClient {
  private adapter: DatabaseAdapter
  private cacheAdapter: CacheAdapter

  constructor() {
    this.adapter = createAdapter()
    this.cacheAdapter = cache.createAdapter()
  }

  async initialize(): Promise<void> {
    await this.adapter.connect()
    await this.cacheAdapter.connect()
  }

  async close(): Promise<void> {
    await this.adapter.disconnect()
    await this.cacheAdapter.disconnect()
  }

  getDrizzle() {
    return this.adapter.getDrizzleClient()
  }

  getKV() {
    return this.cacheAdapter
  }

  // 带缓存的查询
  async queryWithCache<T>(
    key: string,
    queryFn: () => Promise<T[]>,
    ttl: number = 3600
  ): Promise<T[]> {
    // 尝试从缓存获取
    const cached = await this.cacheAdapter.get<T[]>(key)
    if (cached) {
      return cached
    }

    // 从数据库查询
    const result = await queryFn()

    // 缓存结果
    await this.cacheAdapter.set(key, result, ttl)

    return result
  }

  // 清除缓存
  async invalidateCache(pattern: string): Promise<void> {
    await this.cacheAdapter.deletePattern(pattern)
  }

  // 健康检查
  async healthCheck(): Promise<boolean> {
    const dbOk = await this.adapter.healthCheck()
    const cacheOk = await this.cacheAdapter.healthCheck()
    return dbOk && cacheOk
  }
}

export const db = new DatabaseClient()
```

---

## Repository 模式

### Base Repository

```typescript
// packages/db/repositories/base.repository.ts
import { db } from '../client'
import { eq, and, sql } from 'drizzle-orm'

export abstract class BaseRepository<T> {
  abstract table: any

  async findById(id: number): Promise<T | undefined> {
    const result = await db.getDrizzle()
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1)

    return result[0]
  }

  async findOne(conditions: Record<string, any>): Promise<T | undefined> {
    const where = this.buildWhere(conditions)
    const result = await db.getDrizzle()
      .select()
      .from(this.table)
      .where(where)
      .limit(1)

    return result[0]
  }

  async findMany(conditions: Record<string, any> = {}): Promise<T[]> {
    const where = this.buildWhere(conditions)
    return db.getDrizzle()
      .select()
      .from(this.table)
      .where(where)
  }

  async create(data: any): Promise<T> {
    const result = await db.getDrizzle()
      .insert(this.table)
      .values(data)
      .returning()

    return result[0]
  }

  async update(id: number, data: any): Promise<T> {
    const result = await db.getDrizzle()
      .update(this.table)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning()

    return result[0]
  }

  async delete(id: number): Promise<void> {
    await db.getDrizzle()
      .delete(this.table)
      .where(eq(this.table.id, id))
  }

  async count(conditions: Record<string, any> = {}): Promise<number> {
    const where = this.buildWhere(conditions)
    const result = await db.getDrizzle()
      .select({ count: sql<number>`count(*)` })
      .from(this.table)
      .where(where)

    return result[0]?.count || 0
  }

  private buildWhere(conditions: Record<string, any>): any {
    const clauses = []
    for (const [key, value] of Object.entries(conditions)) {
      if (value !== undefined && value !== null) {
        clauses.push(eq(this.table[key], value))
      }
    }
    return clauses.length > 0 ? and(...clauses) : undefined
  }
}
```

### Post Repository

```typescript
// packages/db/repositories/post.repository.ts
import { BaseRepository } from './base.repository'
import { posts, postTags, tags } from '../drizzle/schema'
import { eq, and, desc, like, or, sql } from 'drizzle-orm'

export interface PostFilters {
  status?: string
  userId?: number
  tagId?: number
  search?: string
  publishedAfter?: Date
  publishedBefore?: Date
  limit?: number
  offset?: number
}

export class PostRepository extends BaseRepository<Post> {
  table = posts

  async findWithRelations(
    filters: PostFilters = {},
    include: { author?: boolean; tags?: boolean; videos?: boolean } = {}
  ): Promise<PostWithRelations[]> {
    let query = db.getDrizzle().select().from(posts)

    // 关联查询
    if (include.author) {
      // TODO: 添加 author 关联
    }

    if (include.tags) {
      // TODO: 添加 tags 关联
    }

    // 应用过滤器
    const conditions = this.buildFilters(filters)
    if (conditions) {
      query = query.where(conditions)
    }

    // 排序
    query = query.orderBy(desc(posts.publishedAt))

    // 分页
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    if (filters.offset) {
      query = query.offset(filters.offset)
    }

    return query as any
  }

  async findBySlug(slug: string): Promise<Post | undefined> {
    const result = await db.getDrizzle()
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1)

    return result[0]
  }

  async findPublished(filters: Omit<PostFilters, 'status'> = {}): Promise<Post[]> {
    return this.findMany({ ...filters, status: 'published' })
  }

  async search(query: string, filters: Omit<PostFilters, 'search'> = {}): Promise<Post[]> {
    const searchConditions = or(
      like(posts.title, `%${query}%`),
      like(posts.content, `%${query}%`),
      like(posts.excerpt, `%${query}%`)
    )

    const conditions = this.buildFilters(filters)
    const where = conditions ? and(searchConditions, conditions) : searchConditions

    const result = await db.getDrizzle()
      .select()
      .from(posts)
      .where(where)
      .orderBy(desc(posts.publishedAt))

    return result
  }

  async addTags(postId: number, tagIds: number[]): Promise<void> {
    const values = tagIds.map(tagId => ({
      postId,
      tagId
    }))

    await db.getDrizzle().insert(postTags).values(values)
  }

  async removeTags(postId: number): Promise<void> {
    await db.getDrizzle()
      .delete(postTags)
      .where(eq(postTags.postId, postId))
  }

  async incrementViewCount(postId: number): Promise<void> {
    await db.getDrizzle()
      .update(posts)
      .set({
        viewCount: sql`${posts.viewCount} + 1`
      })
      .where(eq(posts.id, postId))
  }

  private buildFilters(filters: PostFilters): any {
    const conditions = []

    if (filters.status) {
      conditions.push(eq(posts.status, filters.status))
    }

    if (filters.userId) {
      conditions.push(eq(posts.userId, filters.userId))
    }

    if (filters.publishedAfter) {
      conditions.push(sql`${posts.publishedAt} >= ${filters.publishedAfter}`)
    }

    if (filters.publishedBefore) {
      conditions.push(sql`${posts.publishedAt} <= ${filters.publishedBefore}`)
    }

    return conditions.length > 0 ? and(...conditions) : undefined
  }
}

export const postRepository = new PostRepository()
```

---

## 缓存策略

### 缓存适配器

```typescript
// packages/db/cache/vercel-kv.ts
import { CacheAdapter } from './cache.adapter'

export class VercelKVAdapter implements CacheAdapter {
  private kv: KVNamespace

  constructor() {
    this.kv = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }

  async connect(): Promise<void> {
    // KV 连接在构造函数中建立
  }

  async disconnect(): Promise<void> {
    // KV 连接由运行时管理
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.kv.get(key)
    return value ? JSON.parse(value) : undefined
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.kv.set(key, serialized, { ex: ttl })
    } else {
      await this.kv.set(key, serialized)
    }
  }

  async delete(key: string): Promise<void> {
    await this.kv.del(key)
  }

  async deletePattern(pattern: string): Promise<void> {
    const keys = await this.kv.keys(pattern)
    if (keys.length > 0) {
      await this.kv.del(...keys)
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.kv.set('health-check', 'ok')
      return true
    } catch (error) {
      return false
    }
  }
}
```

### 缓存使用示例

```typescript
// 在 Repository 中使用缓存
async getPostById(id: number): Promise<Post | undefined> {
  const cacheKey = `post:${id}`

  return db.queryWithCache(
    cacheKey,
    () => this.findById(id),
    3600 // 1 小时
  )
}

// 在更新时清除缓存
async updatePost(id: number, data: any): Promise<Post> {
  const post = await this.update(id, data)

  // 清除相关缓存
  await db.invalidateCache(`post:${id}`)
  await db.invalidateCache(`posts:*`)
  await db.invalidateCache(`user:${data.userId}:posts`)

  return post
}
```

---

## 迁移管理

### 生成迁移

```bash
# 生成迁移文件
npm run db:generate

# 运行迁移
npm run db:migrate

# 回滚迁移
npm run db:rollback

# 查看迁移状态
npm run db:status
```

### Drizzle 配置

```typescript
// packages/db/drizzle/config.ts
import type { Config } from 'drizzle-kit'

const dbType = process.env.DATABASE_TYPE || 'sqlite'

export default {
  schema: './src/drizzle/schema',
  out: './src/drizzle/migrations',
  driver: dbType === 'vercel' ? 'pg' : 'better-sqlite',
  dbCredentials: dbType === 'vercel'
    ? {
        url: process.env.DATABASE_URL!,
      }
    : {
        url: process.env.DATABASE_PATH || './data/velocms.db',
      },
  verbose: true,
  strict: true,
} satisfies Config
```

---

## 环境变量配置

```bash
# .env.example

# 数据库类型（sqlite 或 vercel）
DATABASE_TYPE=sqlite

# Vercel Postgres（生产环境）
DATABASE_URL=postgresql://user:pass@host/db

# Vercel KV（生产环境）
KV_REST_API_URL=https://your-kv-url
KV_REST_API_TOKEN=your-kv-token

# SQLite（本地开发）
DATABASE_PATH=./data/velocms.db

# 认证
AUTH_SECRET=your-secret-key
AUTH_URL=http://localhost:3000

# 站点配置
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=My Blog
```

---

## 性能优化

### 1. 连接池管理

```typescript
// Vercel Postgres 自动管理连接池
// SQLite 使用 WAL 模式提高并发性能
```

### 2. 查询优化

```typescript
// 使用索引
await db.getDrizzle()
  .select()
  .from(posts)
  .where(eq(posts.slug, slug)) // 使用 slug 索引

// 选择特定字段
await db.getDrizzle()
  .select({
    id: posts.id,
    title: posts.title,
    slug: posts.slug
  })
  .from(posts)

// 避免外键查询，使用 JOIN
```

### 3. 批量操作

```typescript
// 批量插入
await db.getDrizzle()
  .insert(posts)
  .values([...manyPosts])

// 批量更新
await db.getDrizzle()
  .update(posts)
  .set({ status: 'published' })
  .where(inArray(posts.id, [1, 2, 3]))
```

---

## 测试

### 单元测试

```typescript
// tests/repositories/post.repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { postRepository } from '@/db/repositories/post.repository'
import { db } from '@/db/client'

describe('PostRepository', () => {
  beforeEach(async () => {
    // 清理数据库
    await db.getDrizzle().delete(posts)
  })

  it('should create a post', async () => {
    const post = await postRepository.create({
      userId: 1,
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      status: 'published'
    })

    expect(post).toHaveProperty('id')
    expect(post.title).toBe('Test Post')
  })

  it('should find post by slug', async () => {
    await postRepository.create({
      userId: 1,
      title: 'Test Post',
      slug: 'test-post',
      content: 'Test content',
      status: 'published'
    })

    const post = await postRepository.findBySlug('test-post')
    expect(post).toBeDefined()
    expect(post?.slug).toBe('test-post')
  })
})
```

---

## 总结

VeloCMS 数据存储抽象层通过适配器模式实现了多后端支持，使用 Repository 模式封装数据访问逻辑，配合 Drizzle ORM 提供类型安全的查询接口。缓存层集成提高了查询性能，迁移管理确保了数据库版本控制。

**关键优势**：
- 多环境无缝切换
- 类型安全
- 缓存优化
- 易于测试
- 易于扩展
