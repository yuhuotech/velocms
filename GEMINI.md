# VeloCMS - Gemini AI 项目上下文

本项目 **VeloCMS** 是一个为内容创作者打造的轻量级、高性能、多主题的 CMS/博客系统。它利用最新的 Web 技术提供现代化的开发体验和灵活的用户界面。

## 🚀 项目概览

- **核心框架**: 基于 [Next.js 15 (App Router)](https://nextjs.org/) 和 [React 19](https://reactjs.org/)。
- **架构设计**: 采用模块化单体架构，核心逻辑封装在 `packages/` 目录下。
  - `packages/db`: 统一数据库层（Drizzle ORM），支持 SQLite、PostgreSQL 和 MySQL。采用 **Repository（仓库）模式** 进行数据访问。
  - `packages/theme-system`: 用于管理和加载多个网站主题的系统。
  - `packages/template-lang`: 自定义模板引擎 (**VT**)，可将安全、高性能的模板编译为 React 组件。
  - `packages/storage`: 抽象文件存储适配器（本地存储、Vercel Blob）。
- **样式**: 使用 [Tailwind CSS](https://tailwindcss.com/) 和 [Shadcn UI](https://ui.shadcn.com/) 组件库。
- **认证**: 使用 [NextAuth.js v5 (Beta)](https://next-auth.js.org/)。
- **数据库 ORM**: 使用 [Drizzle ORM](https://orm.drizzle.team/) 进行类型安全的 SQL 查询。

## 🛠️ 核心命令

- **开发环境**:
  - `npm run dev`: 在 **3002 端口** 启动开发服务器。使用包装脚本自动处理端口占用。
  - `npm run dev:simple`: 在 3002 端口启动标准 Next.js 开发服务器。
- **数据库管理**:
  - `npm run db:generate`: 根据 Schema 变更生成 Drizzle 迁移文件。
  - `npm run db:push`: 将 Schema 变更直接推送到数据库（推荐开发环境使用）。
  - `npx tsx scripts/init-db.ts`: 初始化/重置数据库，同步表结构并同步预置数据（管理员、欢迎文章、关于页面、导航菜单）。
- **构建与生产**:
  - `npm run build`: 执行数据库初始化并构建 Next.js 应用。
  - `npm run start`: 在 3002 端口启动生产环境服务器。
- **代码规范**:
  - `npm run lint`: 执行 ESLint 检查。
  - `npm run typecheck`: 执行 TypeScript 类型检查。

## 📁 目录结构

- `src/app/`: Next.js App Router 路由（前端页面与 API）。
- `src/components/`: 共享 React 组件。
- `src/lib/`: 工具函数、国际化逻辑和核心库。
- `packages/`: DB、主题、存储和模板的模块化逻辑。
- `themes/`: 存放各种网站主题模板。
- `scripts/`: 用于开发启动和数据库初始化的工具脚本。
- `data/`: 默认存放 SQLite 数据库文件的目录。

## 📜 开发规范

- **国际化 (I18n)**: 所有 UI 文本应通过 `getDictionary` 工具从 `src/locales/` 中获取。支持语言：`zh-CN`（默认）、`en-US`。
- **数据访问**: 始终使用 `packages/db/repositories/` 中定义的 **Repository 模式**。除非特殊情况，禁止在组件中直接编写数据库查询。
- **数据库初始化**: Server Components 和 API Routes 在执行数据操作前，必须调用 `await db.initialize()` 以确保在不同环境下连接均已建立。
- **路径别名 (Path Aliases)**:
  - `@/*`: `src/*`
  - `@/db/*`: `packages/db/*`
  - `@/theme-system/*`: `packages/theme-system/*`
  - `@/template-lang/*`: `packages/template-lang/*`
  - `@/storage/*`: `packages/storage/*`
- **部署**: 针对 **Vercel** 优化，建议数据库和 Blob 存储均选择 `sin1` (新加坡) 区域以保持延迟一致。

## 📝 最近更新
- **完全去模拟化**: 移除了所有前端模拟数据，现在全部由数据库驱动。
- **菜单管理**: 实现了后台和前台联动的动态导航菜单管理功能。
- **自动初始化**: 增加了自动创建欢迎文章和“关于我们”页面的初始化脚本。
- **修复与优化**: 统一了路径别名，并为所有数据页面增加了数据库初始化保护逻辑。