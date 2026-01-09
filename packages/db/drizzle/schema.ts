import * as sqliteSchema from './schema.sqlite'
import * as pgSchema from './schema.postgres'
import * as mysqlSchema from './schema.mysql'

const isPostgres = process.env.DATABASE_TYPE === 'vercel' || process.env.DATABASE_TYPE === 'postgres'
const isMysql = process.env.DATABASE_TYPE === 'mysql'

export const users = isMysql ? mysqlSchema.users : (isPostgres ? pgSchema.users : sqliteSchema.users)
export const posts = isMysql ? mysqlSchema.posts : (isPostgres ? pgSchema.posts : sqliteSchema.posts)
export const videos = isMysql ? mysqlSchema.videos : (isPostgres ? pgSchema.videos : sqliteSchema.videos)
export const tags = isMysql ? mysqlSchema.tags : (isPostgres ? pgSchema.tags : sqliteSchema.tags)
export const postTags = isMysql ? mysqlSchema.postTags : (isPostgres ? pgSchema.postTags : sqliteSchema.postTags)
export const themes = isMysql ? mysqlSchema.themes : (isPostgres ? pgSchema.themes : sqliteSchema.themes)
export const userSettings = isMysql ? mysqlSchema.userSettings : (isPostgres ? pgSchema.userSettings : sqliteSchema.userSettings)
export const assets = isMysql ? mysqlSchema.assets : (isPostgres ? pgSchema.assets : sqliteSchema.assets)
export const snippets = isMysql ? mysqlSchema.snippets : (isPostgres ? pgSchema.snippets : sqliteSchema.snippets)
export const postSnippets = isMysql ? mysqlSchema.postSnippets : (isPostgres ? pgSchema.postSnippets : sqliteSchema.postSnippets)
export const comments = isMysql ? mysqlSchema.comments : (isPostgres ? pgSchema.comments : sqliteSchema.comments)
export const commentRateLimits = isMysql ? mysqlSchema.commentRateLimits : (isPostgres ? pgSchema.commentRateLimits : sqliteSchema.commentRateLimits)
export const captchas = isMysql ? mysqlSchema.captchas : (isPostgres ? pgSchema.captchas : sqliteSchema.captchas)
export const files = isMysql ? mysqlSchema.files : (isPostgres ? pgSchema.files : sqliteSchema.files)
export const settings = isMysql ? mysqlSchema.settings : (isPostgres ? pgSchema.settings : sqliteSchema.settings)
export const pages = isMysql ? mysqlSchema.pages : (isPostgres ? pgSchema.pages : sqliteSchema.pages)
