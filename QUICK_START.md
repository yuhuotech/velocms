# VeloCMS 快速导航指南

## 🌐 前台页面

### 主要页面
- [🏠 首页](http://localhost:3002) - 博客首页，显示文章列表
- [📄 文章列表](http://localhost:3002/posts) - 所有文章的列表
- [🏷️ 标签列表](http://localhost:3002/tags) - 所有标签的列表
- [🔍 搜索](http://localhost:3002/search) - 搜索文章
- [ℹ️ 关于](http://localhost:3002/about) - 网站关于信息

### 示例文章
- [Next.js 15 App Router 完全指南](http://localhost:3002/posts/nextjs-15-app-router-guide)
- [TypeScript 高级类型技巧](http://localhost:3002/posts/typescript-advanced-types)
- [使用 Tailwind CSS 构建现代网站](http://localhost:3002/posts/tailwind-css-modern-websites)
- [React Server Components 深度解析](http://localhost:3002/posts/react-server-components)
- [Vite vs Webpack：构建工具对比](http://localhost:3002/posts/vite-vs-webpack)

### 示例标签
- [Next.js](http://localhost:3002/tags/nextjs) - 15 篇文章
- [React](http://localhost:3002/tags/react) - 12 篇文章
- [TypeScript](http://localhost:3002/tags/typescript) - 8 篇文章
- [Tailwind CSS](http://localhost:3002/tags/tailwindcss) - 6 篇文章
- [CSS](http://localhost:3002/tags/css) - 5 篇文章

---

## 🔧 后台管理

### 入口
- [📊 仪表盘](http://localhost:3002/admin) - 后台首页

### 内容管理
- [📝 文章管理](http://localhost:3002/admin/posts) - 管理所有文章
- [🆕 新建文章](http://localhost:3002/admin/posts/new) - 创建新文章
- [✏️ 编辑文章](http://localhost:3002/admin/posts/1/edit) - 编辑现有文章
- [🏷️ 标签管理](http://localhost:3002/admin/tags) - 管理标签
- [📁 分类管理](http://localhost:3002/admin/categories) - 管理分类

### 配置
- [⚙️ 网站设置](http://localhost:3002/admin/settings) - 配置网站信息

---

## 🚀 快速开始

### 1. 启动开发服务器

```bash
npm run dev
```

服务器会自动启动在 **http://localhost:3002**

### 2. 创建新文章

1. 访问 [新建文章](http://localhost:3002/admin/posts/new)
2. 输入文章标题（Slug 会自动生成）
3. 使用 Markdown 编写文章内容
4. 添加封面图片（URL 或上传）
5. 添加标签
6. 选择分类
7. 保存草稿或发布

### 3. 管理标签

1. 访问 [标签管理](http://localhost:3002/admin/tags)
2. 点击"新建标签"
3. 输入标签名称（Slug 会自动生成）
4. 添加描述（可选）
5. 保存

### 4. 管理分类

1. 访问 [分类管理](http://localhost:3002/admin/categories)
2. 点击"新建分类"
3. 输入分类名称（Slug 会自动生成）
4. 添加描述（可选）
5. 保存

### 5. 配置网站

1. 访问 [网站设置](http://localhost:3002/admin/settings)
2. 切换不同的设置标签
3. 修改配置
4. 点击"保存设置"

---

## 📱 响应式支持

### 桌面端（> 1024px）
- 侧边栏显示
- 文章网格 2 列
- 水平导航菜单

### 平板端（768px - 1024px）
- 侧边栏显示
- 文章网格 2 列
- 水平导航菜单

### 移动端（< 768px）
- 侧边栏隐藏（可抽屉打开）
- 文章列表 1 列
- 汉堡菜单

---

## 🎨 主题切换

- 点击右上角的 🌙/☀️ 图标切换暗黑/明亮模式
- 设置会保存在浏览器本地存储中

---

## 📄 功能列表

### 前台功能

| 功能 | 说明 |
|------|------|
| 文章列表 | 网格布局，卡片展示 |
| 文章详情 | Markdown 渲染，代码高亮 |
| 标签系统 | 标签列表，标签详情 |
| 搜索功能 | 实时搜索，支持标题、摘要、标签 |
| 侧边栏 | 最新文章，热门标签 |
| 响应式设计 | 适配桌面、平板、移动端 |
| 暗黑模式 | 支持主题切换 |

### 后台功能

| 功能 | 说明 |
|------|------|
| 仪表盘 | 统计信息，快速操作 |
| 文章管理 | 列表、搜索、筛选、批量操作 |
| 文章编辑 | 标题、内容、标签、分类、封面 |
| 标签管理 | 增删改查，文章统计 |
| 分类管理 | 增删改查，文章统计 |
| 网站设置 | 通用、作者、SEO、社交媒体 |
| 响应式布局 | 侧边栏抽屉，移动端适配 |

---

## 💡 提示

### 常用快捷键

- `Cmd/Ctrl + K` - 打开搜索（未实现）
- `Cmd/Ctrl + S` - 保存（编辑器中）

### 注意事项

1. **数据持久化**
   - 当前使用内存数据
   - 重启后数据会丢失
   - 需要连接数据库

2. **文件上传**
   - 图片上传仅 UI 展示
   - 需要实现后端接口

3. **认证系统**
   - 后台页面公开访问
   - 需要集成 NextAuth

4. **富文本编辑**
   - 当前使用 Markdown
   - 建议集成富文本编辑器

---

## 📞 获取帮助

- 📖 查看 [COMPLETE_PAGES.md](./COMPLETE_PAGES.md) 了解详细信息
- 📖 查看 [BLOG_HOMEPAGE_UPDATE.md](./BLOG_HOMEPAGE_UPDATE.md) 了解博客首页更新
- 📖 查看 [INSTALLATION_REPORT.md](./INSTALLATION_REPORT.md) 了解安装过程
- 📖 查看 [AGENTS.md](./AGENTS.md) 了解项目结构

---

## 🎉 开始使用

访问 **http://localhost:3002** 开始探索 VeloCMS！

后台管理：**http://localhost:3002/admin**
