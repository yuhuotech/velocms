# VeloCMS

<p align="center">
  <img src="https://raw.githubusercontent.com/your-username/velocms/main/public/logo.png" alt="VeloCMS Logo" width="120" />
</p>

<p align="center">
  <strong>一款专为技术内容创作者打造的轻量级、高性能多主题 CMS/博客系统</strong>
</p>

<p align="center">
  <a href="https://github.com/your-username/velocms/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/your-username/velocms?style=flat-square" alt="License" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://orm.drizzle.team/">
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle" alt="Drizzle ORM" />
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  </a>
</p>

---

## 🌟 项目简介

VeloCMS 是一个基于 **Next.js 15 (App Router)** 和 **React 19** 构建的前后端同构 CMS 系统。它不仅是一个博客，更是一个灵活的内容管理框架。

核心设计目标是**多主题切换**和**标准模板语言**，让开发者和内容创作者（如技术类 UP 主）能够轻松定制属于自己的个性化展示页面。

### ✨ 核心特性

- 🎨 **多主题系统**：支持主题一键切换，采用标准目录结构，支持主题继承与配置。
- 📝 **自定义模板语言 (VT)**：专为 VeloCMS 设计的模板引擎，支持变量、循环、条件判断及模板继承，安全且高性能（编译为 React 组件）。
- 🚀 **现代技术栈**：Next.js 15, React 19, TypeScript, Tailwind CSS, Shadcn UI。
- 💾 **多数据库支持**：基于 Drizzle ORM，支持 MySQL, PostgreSQL (Vercel Postgres) 和 SQLite。
- 🛠️ **全功能后台**：
  - 文章 & 页面管理（支持 Markdown 和富文本 Tiptap 编辑器）
  - 分类 & 标签系统
  - 评论系统（集成验证码）
  - 主题配置管理
  - 文件管理（适配多种存储）
- 🌍 **国际化 (I18n)**：内置中英文支持。
- 🔍 **内置搜索**：基于数据库的高性能内容搜索。
- 🔐 **身份认证**：集成 NextAuth.js，安全可靠。

---

## 🛠️ 技术栈

- **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI**: [React 19](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **数据库**: MySQL, PostgreSQL, SQLite
- **认证**: [NextAuth.js](https://next-auth.js.org/)
- **编辑器**: [Tiptap](https://tiptap.dev/), [React Markdown](https://github.com/remarkjs/react-markdown)
- **代码高亮**: [Shiki](https://shiki.style/), [Highlight.js](https://highlightjs.org/)
- **数据验证**: [Zod](https://zod.dev/)

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/velocms.git
cd velocms
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

复制 `.env.example` 并重命名为 `.env`，然后根据你的环境修改配置：

```bash
cp .env.example .env
```

### 4. 数据库初始化

```bash
# 生成数据库迁移文件
npm run db:generate

# 推送变更到数据库（开发环境推荐）
npm run db:push

# 或者运行迁移脚本
npm run db:migrate
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可查看效果。

---

## 🎨 主题系统 & 模板语言

VeloCMS 的核心在于其强大的主题系统。每个主题都位于 `themes/` 目录下，拥有独立的模板和资产。

### 模板示例 (VT 语法)

```vt
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <h1>{{ post.title }}</h1>
    <div class="meta">
      <span>发布于: {{ post.publishedAt | date('YYYY-MM-DD') }}</span>
    </div>
    <div class="content">
      {{ post.content | markdown }}
    </div>
  </vt-slot>
</vt-extends>
```

详细文档请参考：
- [主题系统设计](./docs/theme-system.md)
- [模板语言规范](./docs/template-language.md)

---

## 📂 项目结构

```
velocms/
├── packages/               # 核心逻辑包
│   ├── db/                 # 数据库 Schema 与 Repository
│   ├── theme-system/       # 主题加载与管理
│   ├── template-lang/      # VT 模板语言编译器
│   └── storage/            # 文件存储适配器
├── src/                    # Next.js 应用源码
│   ├── app/                # App Router 路由
│   ├── components/         # 共享 UI 组件
│   ├── lib/                # 工具函数与核心逻辑
│   └── locales/            # 国际化语言包
├── themes/                 # 网站主题模板
└── public/                 # 静态资源
```

---

## 🗺️ 路线图

- [x] 核心架构搭建
- [x] 多数据库支持 (Drizzle ORM)
- [x] VT 模板引擎基础功能
- [x] 主题切换机制
- [x] 基础后台管理 (文章/页面/评论)
- [ ] 插件系统支持
- [ ] 自动化主题预览
- [ ] 更多官方精美主题

---

## 🤝 参与贡献

我们欢迎任何形式的贡献！无论是修复 Bug、添加新功能还是改进文档，请随时提交 Pull Request。

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 开源协议

本项目采用 [Apache License 2.0](./LICENSE) 开源协议。

---

<p align="center">
  Made with ❤️ by VeloCMS Team
</p>