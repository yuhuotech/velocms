# VeloCMS 架构设计文档

## 项目概述

VeloCMS 是一个专为技术类 UP 主设计的前后端同构博客/CMS 系统，核心特色是支持多主题和标准模板语言。

### 核心特性
- 多主题支持（核心功能）
- 标准模板语言
- 前后端同构（Next.js App Router）
- 多环境部署（Vercel + 本地 SQLite）
- 视频内容关联
- 脚本和代码片段管理
- 开源且易于扩展

---

## 技术栈选型

### 核心框架
- **Next.js 15** - App Router（前后端同构）
- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架（用于管理后台）

### 数据存储
- **Vercel Postgres** - Vercel 生产环境存储
- **Vercel KV** - 缓存和会话管理
- **SQLite** - 本地开发环境
- **Drizzle ORM** - 类型安全的数据库抽象层

### 模板引擎
- **自定义模板引擎** - 基于模板语言的编译器

### 其他工具
- **next-themes** - 主题切换
- **zod** - 数据验证
- **next-auth** - 认证系统
- **react-markdown** - Markdown 渲染
- **shiki** - 代码高亮

---

## 系统架构

### 分层架构

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│   (Themed Frontend + Admin Panel)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Template Engine Layer             │
│   (Compiler + Runtime + Theme Loader)   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Business Logic Layer             │
│  (Content Service + User Service + ...) │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Data Access Layer                 │
│   (Repository Pattern + ORM Abstraction)│
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Storage Layer                   │
│   (Postgres/KV - Vercel / SQLite)       │
└─────────────────────────────────────────┘
```

### 目录结构

```
velocms/
├── apps/
│   ├── web/                    # 前台主题渲染服务
│   │   ├── app/
│   │   │   ├── (theme)/        # 动态主题路由
│   │   │   └── api/            # 公开 API
│   │   └── lib/
│   │       └── template-engine/
│   │           ├── compiler.ts # 模板编译器
│   │           ├── runtime.ts  # 运行时渲染
│   │           └── parser.ts   # 模板解析器
│   │
│   └── admin/                  # 管理后台（Monorepo 可选）
│       ├── app/
│       │   ├── dashboard/
│       │   ├── content/
│       │   ├── themes/
│       │   └── settings/
│       └── components/
│
├── packages/
│   ├── core/                   # 核心业务逻辑
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   └── types/
│   │
│   ├── db/                     # 数据库抽象层
│   │   ├── drizzle/
│   │   │   ├── schema/
│   │   │   └── migrations/
│   │   ├── adapter/
│   │   │   ├── vercel.ts       # Vercel Postgres + KV
│   │   │   └── sqlite.ts       # SQLite
│   │   └── client.ts           # 统一数据库客户端
│   │
│   ├── template-lang/           # 模板语言定义
│   │   ├── ast.ts              # AST 定义
│   │   ├── lexer.ts            # 词法分析
│   │   ├── parser.ts           # 语法分析
│   │   ├── compiler.ts         # 编译为 React 组件
│   │   └── docs/               # 模板语言文档
│   │
│   ├── theme-system/            # 主题系统
│   │   ├── loader.ts           # 主题加载器
│   │   ├── registry.ts         # 主题注册
│   │   ├── validator.ts        # 主题验证
│   │   └── schemas/            # 主题结构定义
│   │
│   └── ui/                     # 共享 UI 组件（管理后台）
│       └── components/
│
├── themes/                     # 默认主题
│   ├── default/
│   │   ├── theme.config.json
│   │   ├── templates/
│   │   │   ├── home.vt
│   │   │   ├── post.vt
│   │   │   └── layout.vt
│   │   └── assets/
│   └── minimal/
│
├── docs/                       # 文档
│   ├── architecture.md
│   ├── template-language.md
│   ├── theme-development.md
│   └── deployment.md
│
├── package.json
├── turbo.json                  # Turborepo 配置（如果使用 monorepo）
└── README.md
```

---

## 核心模块设计

### 1. 模板语言系统（Template Language System）

#### 设计理念
- 安全：防止 XSS 攻击
- 灵活：支持变量、循环、条件、组件
- 可组合：支持模板继承和片段
- 类型安全：集成 TypeScript 类型推断

#### 模板语法示例

```vt
<!-- layout.vt -->
<vt-layout>
  <head>
    <title>{{ site.title }} - {{ page.title }}</title>
  </head>
  <body>
    <vt-include src="header.vt" />
    <vt-slot name="content" />
    <vt-include src="footer.vt" />
  </body>
</vt-layout>

<!-- home.vt -->
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <vt:each item="post" in="posts">
      <article class="post">
        <h2>{{ post.title }}</h2>
        <p>{{ post.excerpt }}</p>
        <a href="{{ post.url }}">Read more</a>
      </article>
    </vt:each>

    <vt:if condition="pagination.hasNext">
      <a href="?page={{ pagination.next }}">Next Page</a>
    </vt:if>
  </vt-slot>
</vt-extends>
```

#### 模板语言特性

| 特性 | 语法 | 说明 |
|------|------|------|
| 变量输出 | `{{ variable }}` | 自动转义 |
| 原始输出 | `{{{ variable }}}` | 不转义 |
| 条件判断 | `<vt:if condition="...">` | 支持 and, or, not |
| 循环 | `<vt:each item="x" in="list">` | 支持 array, object |
| 模板继承 | `<vt:extends src="...">` | 继承父模板 |
| 插槽 | `<vt-slot name="...">` | 可覆盖区域 |
| 包含 | `<vt-include src="...">` | 引入子模板 |
| 过滤器 | `{{ content \| markdown }}` | 内置/自定义过滤器 |
| 组件 | `<vt:component name="Card" />` | React 组件包装 |

#### 编译流程

```
Template (.vt)
    ↓
Lexer (词法分析)
    ↓
Parser (语法分析 → AST)
    ↓
Compiler (AST → React Component)
    ↓
Runtime (React Rendering)
    ↓
HTML
```

### 2. 主题系统（Theme System）

#### 主题结构

```json
{
  "name": "default",
  "version": "1.0.0",
  "author": "VeloCMS",
  "description": "Default theme",
  "config": {
    "colors": {
      "primary": "#0070f3",
      "secondary": "#7928ca"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "layout": {
      "maxWidth": "1200px",
      "sidebar": true
    }
  },
  "templates": {
    "home": "templates/home.vt",
    "post": "templates/post.vt",
    "archive": "templates/archive.vt",
    "tag": "templates/tag.vt"
  },
  "assets": {
    "css": ["assets/style.css"],
    "js": ["assets/main.js"]
  },
  "settings": [
    {
      "key": "showSidebar",
      "type": "boolean",
      "default": true,
      "label": "Show Sidebar"
    }
  ]
}
```

#### 主题加载机制

1. **主题注册**：启动时扫描 `themes/` 目录
2. **主题激活**：用户选择主题，存储在数据库
3. **模板编译**：首次使用时编译模板为 React 组件
4. **缓存机制**：编译后的组件缓存（Vercel KV / Redis）
5. **热更新**：开发环境监听文件变化自动重编译

### 3. 数据存储层（Storage Layer）

#### 抽象接口

```typescript
// packages/db/client.ts
interface DatabaseAdapter {
  // 查询
  query<T>(sql: string, params?: any[]): Promise<T[]>

  // 事务
  transaction<T>(callback: (tx: Transaction) => Promise<T>): Promise<T>

  // 连接管理
  connect(): Promise<void>
  disconnect(): Promise<void>

  // 健康检查
  healthCheck(): Promise<boolean>
}
```

#### Vercel Adapter

```typescript
// Vercel Postgres + KV
- Postgres: 主数据存储（用户、内容、主题配置）
- KV: 缓存、会话、编译后的模板
```

#### SQLite Adapter

```typescript
// 本地开发
- SQLite: 所有数据存储
- 文件系统: 静态资源
```

#### 数据库 Schema

```sql
-- Users
users (id, email, password_hash, name, avatar, role, created_at)

-- Content
posts (id, user_id, title, slug, content, excerpt, status, published_at, created_at, updated_at)
videos (id, user_id, title, url, platform, video_id, created_at)
post_videos (post_id, video_id) -- 关联文章和视频
tags (id, name, slug)
post_tags (post_id, tag_id)

-- Themes
themes (id, name, version, author, description, config, is_active)
user_settings (user_id, theme_id, custom_config)

-- Assets
assets (id, user_id, filename, url, type, size, created_at)

-- Scripts/Code Snippets
snippets (id, user_id, title, code, language, description, created_at)
post_snippets (post_id, snippet_id)
```

### 4. 内容服务（Content Service）

```typescript
// packages/core/services/content.service.ts
class ContentService {
  // 文章 CRUD
  async createPost(data: CreatePostDto): Promise<Post>
  async updatePost(id: string, data: UpdatePostDto): Promise<Post>
  async deletePost(id: string): Promise<void>
  async getPost(slug: string): Promise<Post>
  async listPosts(filters: PostFilters): Promise<PaginatedPosts>

  // 视频关联
  async attachVideo(postId: string, videoId: string): Promise<void>
  async detachVideo(postId: string, videoId: string): Promise<void>

  // 标签管理
  async addTags(postId: string, tags: string[]): Promise<void>
  async removeTag(postId: string, tagId: string): Promise<void>
}
```

### 5. 模板渲染服务（Template Rendering Service）

```typescript
// packages/core/services/template.service.ts
class TemplateService {
  // 编译模板
  async compileTemplate(
    templateName: string,
    themeName: string
  ): Promise<React.ComponentType>

  // 渲染页面
  async renderPage(
    templateName: string,
    data: PageData,
    themeName: string
  ): Promise<string>

  // 缓存管理
  invalidateCache(themeName: string): Promise<void>
}
```

---

## 部署方案

### Vercel 部署

```yaml
# vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["hkg1", "sfo1"],
  "env": {
    "DATABASE_URL": "@postgres-url",
    "KV_URL": "@kv-url",
    "AUTH_SECRET": "@auth-secret"
  },
  "functions": {
    "app/**/api/**": {
      "maxDuration": 30
    }
  }
}
```

### 环境变量

```bash
# Vercel 生产环境
DATABASE_URL=postgresql://user:pass@host/db
KV_URL=redis://user:pass@host
AUTH_SECRET=random-secret-string
NEXT_PUBLIC_SITE_URL=https://yourdomain.com

# 本地开发
DATABASE_TYPE=sqlite
DATABASE_PATH=./data/velocms.db
```

### 本地开发

```bash
# 启动本地开发环境
npm run dev

# 生成数据库迁移
npm run db:generate

# 运行迁移
npm run db:migrate

# 类型检查
npm run typecheck

# Lint
npm run lint
```

---

## 扩展性设计

### 1. 插件系统（Plugin System）

```typescript
// 插件接口
interface Plugin {
  name: string
  version: string
  hooks: {
    onBeforeRender?: (data: PageData) => Promise<PageData>
    onAfterRender?: (html: string) => Promise<string>
    onContentSave?: (content: Post) => Promise<void>
  }
  components?: Record<string, React.ComponentType>
}
```

### 2. 自定义过滤器（Custom Filters）

```typescript
// 注册自定义过滤器
templateEngine.registerFilter('youtube', (url: string) => {
  // 提取 YouTube 视频 ID 并嵌入播放器
  const videoId = extractVideoId(url)
  return `<iframe src="https://youtube.com/embed/${videoId}"></iframe>`
})
```

### 3. 自定义组件（Custom Components）

```vt
<!-- 在模板中使用自定义组件 -->
<vt:component name="YouTubePlayer" videoId="{{ post.videoId }}" />
```

---

## 性能优化

### 1. 缓存策略

- **模板缓存**：编译后的模板缓存在 KV 中
- **页面缓存**：SSG 页面使用 Next.js ISR
- **数据缓存**：频繁查询的数据使用 KV 缓存
- **CDN**：静态资源通过 Vercel CDN 分发

### 2. 数据库优化

- 索引优化（slug、published_at、tags）
- 查询优化（避免 N+1）
- 连接池管理

### 3. 构建优化

- 代码分割
- Tree shaking
- 图片优化（next/image）

---

## 安全考虑

1. **模板沙箱**：防止恶意模板执行危险代码
2. **XSS 防护**：模板默认转义输出
3. **CSRF 防护**：使用 Next.js 内置 CSRF 保护
4. **认证授权**：基于 next-auth 的认证系统
5. **Rate Limiting**：API 请求限流
6. **输入验证**：使用 Zod 验证所有输入

---

## 开发路线图

### Phase 1: 核心功能（MVP）
- [x] 项目架构设计
- [ ] 数据库 Schema 设计
- [ ] 模板语言实现
- [ ] 主题系统基础
- [ ] 用户认证
- [ ] 内容管理（文章 CRUD）

### Phase 2: 核心功能完善
- [ ] 视频关联
- [ ] 标签系统
- [ ] 搜索功能
- [ ] 评论系统
- [ ] 管理后台

### Phase 3: 高级功能
- [ ] 插件系统
- [ ] 多语言支持
- [ ] 自动部署
- [ ] 性能监控

### Phase 4: 生态建设
- [ ] 官方主题库
- [ ] 主题市场
- [ ] 插件市场
- [ ] 社区文档

---

## 总结

VeloCMS 采用现代化的技术栈和清晰的分层架构，核心特色是灵活的模板语言和强大的主题系统。通过抽象数据存储层，实现了多环境部署支持。系统设计注重扩展性、安全性和性能，为技术创作者提供了一个灵活、可靠的内容管理平台。
