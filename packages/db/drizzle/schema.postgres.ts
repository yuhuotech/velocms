import { pgTable, text, serial, integer, boolean, timestamp, json, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  bio: text('bio'),
  website: text('website'),
  role: text('role').notNull().default('user'),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  coverImage: text('cover_image'),
  status: text('status').notNull().default('draft'),
  publishedAt: timestamp('published_at'),
  readingTime: integer('reading_time'),
  viewCount: integer('view_count').notNull().default(0),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const videos = pgTable('videos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  platform: text('platform').notNull(),
  videoId: text('video_id').notNull(),
  duration: integer('duration'),
  thumbnail: text('thumbnail'),
  description: text('description'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const postTags = pgTable('post_tags', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
})

export const themes = pgTable('themes', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  version: text('version').notNull(),
  author: text('author'),
  description: text('description'),
  config: json('config'),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const userSettings = pgTable('user_settings', {
  userId: integer('user_id').primaryKey(),
  themeId: integer('theme_id').references(() => themes.id),
  customConfig: json('custom_config'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  url: text('url').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  width: integer('width'),
  height: integer('height'),
  alt: text('alt'),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const snippets = pgTable('snippets', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  code: text('code').notNull(),
  language: text('language').notNull(),
  description: text('description'),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const postSnippets = pgTable('post_snippets', {
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  snippetId: integer('snippet_id').notNull().references(() => snippets.id, { onDelete: 'cascade' }),
})

export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  parentId: integer('parent_id').references((): any => comments.id, { onDelete: 'cascade' }),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email'),
  content: text('content').notNull(),
  status: text('status').notNull().default('pending'),
  isAdmin: boolean('is_admin').notNull().default(false),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const commentRateLimits = pgTable('comment_rate_limits', {
  id: serial('id').primaryKey(),
  ipAddress: text('ip_address').notNull(),
  postId: integer('post_id').notNull(),
  count: integer('count').notNull().default(0),
  resetAt: timestamp('reset_at').notNull(),
})

export const captchas = pgTable('captchas', {
  id: serial('id').primaryKey(),
  code: text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  expiresIdx: index('captcha_expires_idx').on(table.expiresAt),
}))

export const files = pgTable('files', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  originalName: text('original_name').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  storageType: text('storage_type').notNull().default('local'),
  storagePath: text('storage_path').notNull(),
  url: text('url'),
  uploadedBy: integer('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  uploadedByIdx: index('files_uploaded_by_idx').on(table.uploadedBy),
}))

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  // Site Info
  siteName: text('site_name').default('VeloCMS'),
  siteDescription: text('site_description'),
  siteUrl: text('site_url'),
  language: text('language').default('zh-CN'),

  // Author Info
  authorName: text('author_name'),
  authorEmail: text('author_email'),
  authorBio: text('author_bio'),

  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),

  // Social
  twitterHandle: text('twitter_handle'),
  githubHandle: text('github_handle'),

  // Config flags
  emailNotifications: boolean('email_notifications').default(true),
  commentNotifications: boolean('comment_notifications').default(true),

  updatedAt: timestamp('updated_at').defaultNow(),
})

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  status: text('status').notNull().default('published'),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(),
  url: text('url').notNull(),
  order: integer('order').default(0),
  parentId: integer('parent_id'),
  target: text('target').default('_self'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
