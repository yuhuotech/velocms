#!/usr/bin/env node

import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'

const sqlite = new Database('./data/velocms.db')

// Create users table with username
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    bio TEXT,
    website TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    email_verified INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`)

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'
const ADMIN_EMAIL = 'admin@velocms.dev'
const ADMIN_NAME = 'Admin'

async function createAdmin() {
  console.log('🔐 初始化管理员账号...\n')

  try {
    // 检查是否已存在管理员
    const existingUser = sqlite.prepare('SELECT id FROM users WHERE username = ?').get(ADMIN_USERNAME)

    if (existingUser) {
      console.log('✅ 管理员账号已存在')
      console.log(`   用户名: ${ADMIN_USERNAME}`)
      console.log(`   密码: ${ADMIN_PASSWORD}`)
      return
    }

    // 创建管理员
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    const now = Date.now()

    sqlite.prepare(`
      INSERT INTO users (username, email, name, password_hash, role, email_verified, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_NAME, passwordHash, 'admin', 1, now, now)

    console.log('✅ 管理员账号创建成功！')
    console.log(`   用户名: ${ADMIN_USERNAME}`)
    console.log(`   密码: ${ADMIN_PASSWORD}`)
    console.log(`   邮箱: ${ADMIN_EMAIL}`)
    console.log('\n⚠️  请在首次登录后立即修改密码！')
  } catch (error) {
    console.error('❌ 创建管理员失败:', error)
    process.exit(1)
  } finally {
    sqlite.close()
  }
}

createAdmin()
