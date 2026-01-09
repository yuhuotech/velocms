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
  let adminId = 1;
  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.username, ADMIN_USERNAME),
  });

  if (!existingAdmin) {
    console.log('👤 创建默认管理员 (admin/admin123)...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    const result = await db.insert(schema.users).values({
      username: ADMIN_USERNAME,
      email: 'admin@velocms.dev',
      name: 'Admin',
      passwordHash: passwordHash,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    adminId = result[0].id;
  } else {
    adminId = existingAdmin.id;
  }

  // 2. 初始化设置
  const existingSettings = await db.query.settings.findFirst();
  if (!existingSettings) {
    console.log('⚙️ 初始化站点配置...');
    await db.insert(schema.settings).values({
      siteName: 'VeloCMS',
      siteDescription: '一个现代化的轻量级内容管理系统',
      language: 'zh-CN',
      authorName: 'Admin',
      authorEmail: 'admin@velocms.dev',
      updatedAt: new Date(),
    });
  }

  // 3. 初始化默认标签
  const existingTag = await db.query.tags.findFirst({
    where: eq(schema.tags.slug, 'general'),
  });
  let tagId = 1;
  if (!existingTag) {
    console.log('🏷️ 创建默认标签...');
    const result = await db.insert(schema.tags).values({
      name: '默认分类',
      slug: 'general',
      description: '默认文章分类',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    tagId = result[0].id;
  } else {
    tagId = existingTag.id;
  }

  // 4. 初始化欢迎文章
  const existingPost = await db.query.posts.findFirst({
    where: eq(schema.posts.slug, 'hello-velocms'),
  });
  if (!existingPost) {
    console.log('📝 创建欢迎文章...');
    const postResult = await db.insert(schema.posts).values({
      userId: adminId,
      title: '欢迎使用 VeloCMS',
      slug: 'hello-velocms',
      content: `# 欢迎使用 VeloCMS

VeloCMS 是一个基于 Next.js 15 和 Drizzle ORM 构建的现代化轻量级内容管理系统。

## 主要特性

- **现代技术栈**：Next.js 15, React 19, Tailwind CSS, Drizzle ORM
- **多数据库支持**：完美支持 SQLite, MySQL, PostgreSQL
- **高度可定制**：灵活的主题系统和组件化架构
- **极致性能**：利用 Next.js Server Components 提供极快的访问速度
- **极简管理**：直观的后台管理界面

## 如何开始？

1. 访问 \`/admin\` 进入管理后台
2. 使用默认账号 \`admin / admin123\` 登录
3. 开始创作你的第一篇文章吧！

如果您在使用过程中遇到任何问题，欢迎访问我们的官方仓库。
`,
      excerpt: '欢迎使用 VeloCMS，这是一个基于 Next.js 15 的现代化轻量级内容管理系统。本文将带你了解它的核心特性和快速上手指南。',
      status: 'published',
      publishedAt: new Date(),
      readingTime: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // 关联标签
    await db.insert(schema.postTags).values({
      postId: postResult[0].id,
      tagId: tagId,
    });
  }

  // 5. 初始化导航菜单
  const existingMenus = await db.query.menus.findFirst();
  if (!existingMenus) {
    console.log('🗺️ 初始化导航菜单...');
    await db.insert(schema.menus).values([
      { label: '首页', url: '/', order: 1 },
      { label: '所有文章', url: '/posts', order: 2 },
      { label: '标签', url: '/tags', order: 3 },
      { label: '关于', url: '/about', order: 4 },
    ]);
  }

  // 6. 初始化“关于”页面
  const existingAboutPage = await db.query.pages.findFirst({
    where: eq(schema.pages.slug, 'about'),
  });
  if (!existingAboutPage) {
    console.log('📄 创建“关于”页面...');
    await db.insert(schema.pages).values({
      title: '关于我们',
      slug: 'about',
      content: `# 关于 VeloCMS

VeloCMS 是一款专为技术内容创作者打造的轻量级、高性能多主题 CMS/博客系统。

## 我们的愿景

我们致力于提供一个既简单易用又高度可定制的内容发布平台，让创作者能够专注于内容本身，而无需担心底层技术的复杂性。

## 技术特性

- **响应式设计**：完美适配各种屏幕尺寸。
- **SEO 友好**：内置 SEO 优化，助力内容传播。
- **极致速度**：基于 Next.js 15 的服务端渲染技术。
- **安全可靠**：集成现代化的身份验证和数据保护机制。

## 联系我们

如果您有任何建议或合作意向，欢迎通过以下方式联系：

- **Email**: admin@velocms.dev
- **GitHub**: [VeloCMS Repository](https://github.com/your-username/velocms)

感谢您选择 VeloCMS！
`,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  
  // (此处省略了主题同步逻辑，保持脚本简洁，建议放在管理后台首次加载或保持在此处)
}

main();