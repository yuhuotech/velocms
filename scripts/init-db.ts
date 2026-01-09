import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/db/drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

async function main() {
  console.log('🔄 开始系统初始化与数据同步...');

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('⚠️ 未检测到数据库，跳过。');
    return;
  }

  const client = postgres(dbUrl, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // --- 1. 初始化管理员 ---
    const ADMIN_USERNAME = 'admin';
    const existingAdmin = await db.query.users.findFirst({
      where: eq(schema.users.username, ADMIN_USERNAME),
    });

    if (!existingAdmin) {
      console.log('👤 创建默认管理员...');
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

    // --- 2. 初始化全局设置 ---
    const existingSettings = await db.query.settings.findFirst();
    if (!existingSettings) {
      console.log('⚙️ 初始化全局设置...');
      await db.insert(schema.settings).values({
        key: 'site_config',
        value: JSON.stringify({
          siteName: 'VeloCMS',
          description: '基于 Next.js 的多主题 CMS',
          language: 'zh-CN',
          theme: 'default'
        }),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // --- 3. 自动同步主题目录 ---
    console.log('🎨 同步主题数据...');
    const themesDir = path.join(process.cwd(), 'themes');
    try {
      const entries = await fs.readdir(themesDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const configPath = path.join(themesDir, entry.name, 'theme.config.json');
          try {
            const configContent = await fs.readFile(configPath, 'utf-8');
            const config = JSON.parse(configContent);
            
            // 幂等更新：存在则更新，不存在则插入
            // Drizzle 的 upsert 语法在不同数据库下有差异，这里我们用简单的逻辑
            const existingTheme = await db.query.themes.findFirst({
              where: eq(schema.themes.name, config.name)
            });

            const themeData = {
              name: config.name,
              version: config.version,
              author: config.author?.name || 'Unknown',
              description: config.description || '',
              config: JSON.stringify(config.config || {}),
              isActive: config.name === 'default' ? 1 : 0,
              updatedAt: new Date(),
            };

            if (existingTheme) {
              await db.update(schema.themes).set(themeData).where(eq(schema.themes.id, existingTheme.id));
            } else {
              await db.insert(schema.themes).values({
                ...themeData,
                createdAt: new Date(),
              });
            }
          } catch (e) {
            console.warn(`⚠️ 跳过无效主题: ${entry.name}`);
          }
        }
      }
    } catch (e) {
      console.warn('⚠️ 未找到 themes 目录，跳过主题同步。');
    }

    // --- 4. 示例内容初始化 ---
    const postCount = await db.select({ count: sql<number>`count(*)` }).from(schema.posts);
    if (Number(postCount[0].count) === 0) {
      console.log('📝 创建欢迎文章...');
      await db.insert(schema.posts).values({
        title: '欢迎使用 VeloCMS',
        slug: 'hello-velocms',
        content: '这是一个全自动初始化的示例文章。你可以在后台修改或删除它。',
        excerpt: '欢迎来到你的新博客！',
        status: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('✅ 系统初始化完成！');
  } catch (error) {
    console.error('❌ 初始化失败:', error);
  } finally {
    await client.end();
  }
}

main();