import * as sqliteSchema from './schema.sqlite'
import * as pgSchema from './schema.postgres'

const isPostgres = process.env.DATABASE_TYPE === 'vercel' || process.env.DATABASE_TYPE === 'postgres'

export const users = isPostgres ? pgSchema.users : sqliteSchema.users
export const posts = isPostgres ? pgSchema.posts : sqliteSchema.posts
export const videos = isPostgres ? pgSchema.videos : sqliteSchema.videos
export const tags = isPostgres ? pgSchema.tags : sqliteSchema.tags
export const postTags = isPostgres ? pgSchema.postTags : sqliteSchema.postTags
export const themes = isPostgres ? pgSchema.themes : sqliteSchema.themes
export const userSettings = isPostgres ? pgSchema.userSettings : sqliteSchema.userSettings
export const assets = isPostgres ? pgSchema.assets : sqliteSchema.assets
export const snippets = isPostgres ? pgSchema.snippets : sqliteSchema.snippets
export const postSnippets = isPostgres ? pgSchema.postSnippets : sqliteSchema.postSnippets
export const comments = isPostgres ? pgSchema.comments : sqliteSchema.comments
export const commentRateLimits = isPostgres ? pgSchema.commentRateLimits : sqliteSchema.commentRateLimits
export const captchas = isPostgres ? pgSchema.captchas : sqliteSchema.captchas
export const files = isPostgres ? pgSchema.files : sqliteSchema.files
export const settings = isPostgres ? pgSchema.settings : sqliteSchema.settings
export const pages = isPostgres ? pgSchema.pages : sqliteSchema.pages
