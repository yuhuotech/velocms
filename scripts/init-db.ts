import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../packages/db/drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🔄 开始自动化数据库同步与初始化...');

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  const isPostgres = !!(process.env.POSTGRES_URL || process.env.DATABASE_URL?.startsWith('postgres'));

  if (!dbUrl && isPostgres) {
    console.log('⚠️ 未检测到 Postgres 连接字符串，跳过。');
    return;
  }

  try {
    if (isPostgres) {
      // --- Postgres 自动迁移 ---
      console.log('📡 正在执行 Postgres 数据库迁移...');
      const migrationClient = postgres(dbUrl!, { max: 1 });
      const db = drizzle(migrationClient, { schema });
      
      await migrate(db, { 
        migrationsFolder: path.join(process.cwd(), 'packages/db/drizzle/migrations/postgres') 
      });
      console.log('✅ Postgres 迁移完成。');

      // --- 初始化数据 ---
      await seedData(db);
      await migrationClient.end();
    } else {
      // --- SQLite 自动迁移 ---
      console.log('📡 正在执行 SQLite 数据库迁移...');
      const { drizzle: drizzleSqlite } = await import('drizzle-orm/better-sqlite3');
      const { migrate: migrateSqlite } = await import('drizzle-orm/better-sqlite3/migrator');
      const Database = (await import('better-sqlite3')).default;
      
      const dbPath = process.env.DATABASE_PATH || './data/velocms.db';
      const dir = path.dirname(dbPath);
      try { await fs.mkdir(dir, { recursive: true }); } catch (e) {}

      const sqlite = new Database(dbPath);
      const db = drizzleSqlite(sqlite, { schema });
      
      await migrateSqlite(db, { 
        migrationsFolder: path.join(process.cwd(), 'packages/db/drizzle/migrations/sqlite') 
      });
      console.log('✅ SQLite 迁移完成。');

      await seedData(db);
      sqlite.close();
    }
    console.log('🎉 数据库初始化成功！');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  }
}

async function seedData(db: any) {
  // 1. 初始化管理员
  const ADMIN_USERNAME = 'admin';
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.username, ADMIN_USERNAME),
  });

  if (!existingAdmin) {
    console.log('👤 创建默认管理员 (admin/admin123)...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    await db.insert(schema.users).values({
      username: ADMIN_USERNAME,
      email: 'admin@velocms.dev',
      name: 'Admin',
      passwordHash: passwordHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // 2. 初始化设置
  const existingSettings = await db.query.settings.findFirst();
  if (!existingSettings) {
    console.log('⚙️ 初始化站点配置...');
    await db.insert(schema.settings).values({
      key: 'site_config',
      value: JSON.stringify({ siteName: 'VeloCMS', language: 'zh-CN' }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // (此处省略了主题同步逻辑，保持脚本简洁，建议放在管理后台首次加载或保持在此处)
}

main();