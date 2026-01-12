import {
  mysqlTable,
  text,
  serial,
  int,
  boolean,
  timestamp,
  json,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  website: varchar("website", { length: 255 }),
  role: varchar("role", { length: 50 }).notNull().default("user"),
  emailVerified: boolean("email_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const posts = mysqlTable("posts", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  categoryId: int("category_id"),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  status: varchar("status", { length: 50 }).notNull().default("draft"),
  publishedAt: timestamp("published_at"),
  readingTime: int("reading_time"),
  viewCount: int("view_count").notNull().default(0),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const videos = mysqlTable("videos", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  url: text("url").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  videoId: varchar("video_id", { length: 255 }).notNull(),
  duration: int("duration"),
  thumbnail: text("thumbnail"),
  description: text("description"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const tags = mysqlTable("tags", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const postTags = mysqlTable("post_tags", {
  postId: int("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  tagId: int("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

export const categories = mysqlTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const themes = mysqlTable("themes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  version: varchar("version", { length: 50 }).notNull(),
  author: varchar("author", { length: 255 }),
  description: text("description"),
  config: json("config"),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const userSettings = mysqlTable("user_settings", {
  userId: int("user_id").primaryKey(), // Using int as PK manually since it's a 1:1 relation without auto-increment
  themeId: int("theme_id").references(() => themes.id),
  customConfig: json("custom_config"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const assets = mysqlTable("assets", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  size: int("size").notNull(),
  width: int("width"),
  height: int("height"),
  alt: text("alt"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const snippets = mysqlTable("snippets", {
  id: serial("id").primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  code: text("code").notNull(),
  language: varchar("language", { length: 50 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const postSnippets = mysqlTable("post_snippets", {
  postId: int("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  snippetId: int("snippet_id")
    .notNull()
    .references(() => snippets.id, { onDelete: "cascade" }),
});

export const comments = mysqlTable("comments", {
  id: serial("id").primaryKey(),
  postId: int("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }),
  parentId: int("parent_id").references((): any => comments.id, {
    onDelete: "cascade",
  }),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  authorEmail: varchar("author_email", { length: 255 }),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  isAdmin: boolean("is_admin").notNull().default(false),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const commentRateLimits = mysqlTable("comment_rate_limits", {
  id: serial("id").primaryKey(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  postId: int("post_id").notNull(),
  count: int("count").notNull().default(0),
  resetAt: timestamp("reset_at").notNull(),
});

export const captchas = mysqlTable(
  "captchas",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 20 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    expiresIdx: index("captcha_expires_idx").on(table.expiresAt),
  }),
);

export const files = mysqlTable(
  "files",
  {
    id: serial("id").primaryKey(),
    filename: varchar("filename", { length: 255 }).notNull(),
    originalName: varchar("original_name", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: int("size").notNull(),
    storageType: varchar("storage_type", { length: 50 })
      .notNull()
      .default("local"),
    storagePath: text("storage_path").notNull(),
    url: text("url"),
    uploadedBy: int("uploaded_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    uploadedByIdx: index("files_uploaded_by_idx").on(table.uploadedBy),
  }),
);

export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  // Site Info
  siteName: varchar("site_name", { length: 255 }).default("VeloCMS"),
  siteDescription: text("site_description"),
  siteUrl: varchar("site_url", { length: 255 }),
  language: varchar("language", { length: 20 }).default("zh-CN"),
  logoUrl: text("logo_url"),

  // Author Info
  authorName: varchar("author_name", { length: 255 }),
  authorEmail: varchar("author_email", { length: 255 }),
  authorBio: text("author_bio"),

  // SEO
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),

  // Social
  twitterHandle: varchar("twitter_handle", { length: 255 }),
  githubHandle: varchar("github_handle", { length: 255 }),

  // Config flags
  emailNotifications: boolean("email_notifications").default(true),
  commentNotifications: boolean("comment_notifications").default(true),

  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const pages = mysqlTable("pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("published"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  sortOrder: int("sort_order").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const menus = mysqlTable("menus", {
  id: serial("id").primaryKey(),
  label: varchar("label", { length: 255 }).notNull(),
  url: text("url").notNull(),
  sortOrder: int("sort_order").default(0),
  parentId: int("parent_id"),
  target: varchar("target", { length: 50 }).default("_self"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
