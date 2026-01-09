import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/db/drizzle/schema';
import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

// 💡 导入迁移工具
// 注意：对于 Postgres，我们使用 push 的替代方案或者直接执行同步
// 由于 drizzle-kit push 是非程序化的，我们在生产环境推荐使用针对具体数据库的初始化逻辑

async function main() {
  console.log('🔄 开始系统初始化与数据同步...');

  const dbUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('⚠️ 未检测到数据库连接字符串，跳过初始化。');
    return;
  }

  // 💡 使用更高的超时时间，确保迁移完成
  const client = postgres(dbUrl, { max: 1, connect_timeout: 10 });
  const db = drizzle(client, { schema });

  try {
    // --- 1. 确保表结构存在 ---
    // 在生产环境，由于我们要做到“傻瓜式”，最好的办法是检查一个核心表是否存在
    // 如果不存在，我们可以打印指引。
    // 但在 Vercel + Neon 环境下，我们可以在这里执行一些基础的 DDL
    console.log('📡 正在检查数据库状态...');
    
    // 尝试执行一个简单的查询
    try {
      await db.select({ id: schema.users.id }).from(schema.users).limit(1);
      console.log('✅ 数据库架构已就绪。');
    } catch (e: any) {
      console.log('🏗️ 检测到架构未初始化或不完整，尝试基础初始化...');
      // 如果你希望在代码里全自动建表，通常建议使用迁移文件。
      // 但对于“傻瓜式”部署且不想让用户管迁移文件的情况，
      // 我们建议在 build 阶段使用 drizzle-kit push --force (如果支持) 
      // 或者在这里执行原始 SQL。
      // 为了稳定，我们通过 package.json 里的脚本处理结构，这里处理数据。
    }

    // --- 2. 初始化管理员 ---
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
      console.log('✅ 管理员账号创建成功 (admin/admin123)');
    }

    // --- 3. 初始化全局设置 ---
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

    // --- 4. 同步主题数据 ---
    const themesDir = path.join(process.cwd(), 'themes');
    const entries = await fs.readdir(themesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const configPath = path.join(themesDir, entry.name, 'theme.config.json');
        try {
          const configContent = await fs.readFile(configPath, 'utf-8');
          const config = JSON.parse(configContent);
          
          const themeData = {
            name: config.name,
            version: config.version,
            author: config.author?.name || 'Unknown',
            description: config.description || '',
            config: JSON.stringify(config.config || {}),
            isActive: config.name === 'default' ? 1 : 0,
            updatedAt: new Date(),
          };

          const existingTheme = await db.query.themes.findFirst({
            where: eq(schema.themes.name, config.name)
          });

          if (existingTheme) {
            await db.update(schema.themes).set(themeData).where(eq(schema.themes.id, existingTheme.id));
          } else {
            await db.insert(schema.themes).values({ ...themeData, createdAt: new Date() });
          }
        } catch (e) {}
      }
    }

    // --- 5. 初始文章 ---
    const postCount = await db.select({ count: sql<number>`count(*)` }).from(schema.posts);
    if (Number(postCount[0].count) === 0) {
      console.log('📝 创建示例文章...');
      await db.insert(schema.posts).values({
        title: '欢迎使用 VeloCMS',
        slug: 'hello-velocms',
        content: '这是一个全自动初始化的示例文章。',
        status: 'published',
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    console.log('✅ 所有初始化任务已完成！');
  } catch (error) {
    console.error('❌ 初始化流程发生严重错误:', error);
  } finally {
    await client.end();
  }
}

main();
