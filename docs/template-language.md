# VeloCMS 模板语言规范

## 概述

VeloCMS 模板语言（VT）是一种专为 VeloCMS 设计的模板语言，用于创建可切换的主题。它被编译为 React 组件，实现高性能的服务端渲染和客户端水合。

**设计目标**：
- ✅ 简单易学：语法直观，类似 Handlebars/Mustache
- ✅ 类型安全：与 TypeScript 类型系统集成
- ✅ 高性能：编译为 React 组件，支持 SSG/SSR
- ✅ 安全：默认转义，防止 XSS
- ✅ 可扩展：支持自定义过滤器和组件

---

## 基础语法

### 变量输出

```vt
<!-- 转义输出（推荐） -->
<h1>{{ post.title }}</h1>
<p>{{ post.content }}</p>

<!-- 原始输出（信任内容） -->
<div>{{{ post.rawHtml }}}</div>
```

### 注释

```vt
<vt:comment>这是一段注释，不会显示在输出中</vt:comment>
```

---

## 控制结构

### 条件判断

```vt
<!-- 简单条件 -->
<vt:if condition="post.published">
  <span class="badge">Published</span>
</vt:if>

<!-- 条件分支 -->
<vt:if condition="post.status === 'published'">
  <span>已发布</span>
<vt:elseif condition="post.status === 'draft'" />
  <span>草稿</span>
<vt:else />
  <span>未知状态</span>
</vt:if>

<!-- 逻辑运算 -->
<vt:if condition="post.published && user.canEdit">
  <button>Edit Post</button>
</vt:if>

<vt:if condition="!post.comments || post.comments.length === 0">
  <p>No comments yet</p>
</vt:if>
```

### 循环

```vt
<!-- 数组循环 -->
<vt:each item="post" in="posts">
  <article>
    <h2>{{ post.title }}</h2>
    <p>{{ post.excerpt }}</p>
  </article>
</vt:each>

<!-- 带索引的循环 -->
<vt:each item="post" in="posts" index="i">
  <div class="post" data-index="{{ i }}">
    {{ post.title }}
  </div>
</vt:each>

<!-- 对象循环 -->
<vt:each item="value" key="key" in="metadata">
  <div>
    <strong>{{ key }}:</strong> {{ value }}
  </div>
</vt:each>

<!-- 空状态处理 -->
<vt:each item="post" in="posts" empty="posts-empty">
  <article>{{ post.title }}</article>
</vt:each>

<vt:block id="posts-empty">
  <p>No posts found</p>
</vt:block>
```

---

## 模板继承

### 基础模板

```vt
<!-- templates/layout.vt -->
<vt-layout>
  <!DOCTYPE html>
  <html lang="{{ site.language }}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{{ site.title }} - {{ page.title }}</title>
      <meta name="description" content="{{ page.description }}" />

      <!-- 样式 -->
      <vt:each item="cssFile" in="theme.assets.css">
        <link rel="stylesheet" href="{{ cssFile }}" />
      </vt:each>

      <!-- 脚本 -->
      <vt:each item="jsFile" in="theme.assets.js">
        <script src="{{ jsFile }}" defer></script>
      </vt:each>
    </head>
    <body class="{{ bodyClass }}">
      <div class="container">
        <vt-include src="header.vt" />

        <main>
          <vt-slot name="content" />
        </main>

        <vt-include src="footer.vt" />
      </div>

      <vt-slot name="scripts" />
    </body>
  </html>
</vt-layout>
```

### 继承模板

```vt
<!-- templates/home.vt -->
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <h1>Welcome to {{ site.title }}</h1>

    <div class="posts-grid">
      <vt:each item="post" in="posts">
        <article class="post-card">
          <img src="{{ post.coverImage }}" alt="{{ post.title }}" />
          <h2>{{ post.title }}</h2>
          <p>{{ post.excerpt }}</p>
          <time>{{ post.publishedAt | date('YYYY-MM-DD') }}</time>
          <a href="{{ post.url }}">Read more →</a>
        </article>
      </vt:each>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <vt:if condition="pagination.hasPrev">
        <a href="?page={{ pagination.prev }}">Previous</a>
      </vt:if>

      <span>Page {{ pagination.current }} of {{ pagination.total }}</span>

      <vt:if condition="pagination.hasNext">
        <a href="?page={{ pagination.next }}">Next</a>
      </vt:if>
    </div>
  </vt-slot>
</vt-extends>
```

---

## 模板包含

### 简单包含

```vt
<!-- 包含子模板 -->
<vt-include src="header.vt" />
<vt-include src="footer.vt" />

<!-- 带数据传递 -->
<vt-include src="sidebar.vt" data="{ widgets: sidebarWidgets }" />
```

### 模板片段

```vt
<!-- 定义片段 -->
<vt:block id="post-card">
  <article class="post-card">
    <h2>{{ post.title }}</h2>
    <p>{{ post.excerpt }}</p>
  </article>
</vt:block>

<!-- 使用片段 -->
<vt:each item="post" in="posts">
  <vt:embed src="post-card" data="{ post: post }" />
</vt:each>
```

---

## 过滤器

### 内置过滤器

```vt
<!-- 字符串处理 -->
{{ title | truncate(50) }}
{{ content | stripHtml | truncate(200) }}
{{ slug | capitalize }}

<!-- 日期格式化 -->
{{ post.publishedAt | date('YYYY-MM-DD HH:mm') }}
{{ post.createdAt | date('fromNow') }}

<!-- Markdown 渲染 -->
{{ post.content | markdown }}

<!-- 代码高亮 -->
{{ post.code | highlight('javascript') }}

<!-- URL 处理 -->
{{ videoUrl | youtubeEmbed }}
{{ post.image | resize(800, 600) }}

<!-- 数组操作 -->
{{ tags | join(', ') }}
{{ posts | length }}
{{ items | first }}
{{ items | last }}

<!-- 条件过滤 -->
{{ posts | filter('published', true) }}
{{ posts | sortBy('publishedAt', 'desc') }}
```

### 内置过滤器列表

| 过滤器 | 说明 | 示例 |
|--------|------|------|
| `truncate(length)` | 截断文本 | `{{ text \| truncate(100) }}` |
| `capitalize` | 首字母大写 | `{{ name \| capitalize }}` |
| `upper` | 转大写 | `{{ text \| upper }}` |
| `lower` | 转小写 | `{{ text \| lower }}` |
| `stripHtml` | 去除 HTML | `{{ content \| stripHtml }}` |
| `date(format)` | 格式化日期 | `{{ date \| date('YYYY-MM-DD') }}` |
| `fromNow` | 相对时间 | `{{ date \| fromNow }}` |
| `markdown` | Markdown 渲染 | `{{ content \| markdown }}` |
| `highlight(lang)` | 代码高亮 | `{{ code \| highlight('js') }}` |
| `default(value)` | 默认值 | `{{ name \| default('Anonymous') }}` |
| `json` | JSON 序列化 | `{{ data \| json }}` |
| `length` | 数组/字符串长度 | `{{ items \| length }}` |
| `join(separator)` | 数组连接 | `{{ tags \| join(', ') }}` |
| `first` | 第一个元素 | `{{ items \| first }}` |
| `last` | 最后一个元素 | `{{ items \| last }}` |
| `reverse` | 反转数组 | `{{ items \| reverse }}` |
| `slice(start, end)` | 数组切片 | `{{ items \| slice(0, 5) }}` |
| `sort` | 数组排序 | `{{ items \| sort }}` |
| `sortBy(key, order)` | 按属性排序 | `{{ posts \| sortBy('date', 'desc') }}` |

### 链式过滤器

```vt
<!-- 多个过滤器串联 -->
{{ content | stripHtml | truncate(200) | default('No content') }}

{{ post.publishedAt | date('YYYY') }} 年
```

---

## 组件系统

### 内置组件

```vt
<!-- 图片组件（自动优化） -->
<vt-image
  src="{{ post.coverImage }}"
  alt="{{ post.title }}"
  width="800"
  height="600"
  loading="lazy"
/>

<!-- 视频播放器 -->
<vt-video
  url="{{ post.videoUrl }}"
  platform="youtube"
  autoplay="false"
/>

<!-- 代码块 -->
<vt-code
  language="javascript"
  showLineNumbers="true"
>
  {{ post.codeSnippet }}
</vt-code>

<!-- 分页组件 -->
<vt-pagination
  current="{{ pagination.current }}"
  total="{{ pagination.total }}"
  prevUrl="{{ pagination.prevUrl }}"
  nextUrl="{{ pagination.nextUrl }}"
/>
```

### 自定义组件

#### 1. 注册 React 组件

```typescript
// packages/core/template-engine/components.tsx
import { YouTubePlayer } from './YouTubePlayer'

export const components = {
  YouTubePlayer: YouTubePlayer,
  AuthorCard: ({ name, avatar, bio }) => (
    <div className="author-card">
      <img src={avatar} alt={name} />
      <h3>{name}</h3>
      <p>{bio}</p>
    </div>
  )
}
```

#### 2. 在模板中使用

```vt
<!-- 使用自定义组件 -->
<vt:component name="YouTubePlayer" videoId="{{ post.youtubeId }}" />

<vt:component
  name="AuthorCard"
  name="{{ post.author.name }}"
  avatar="{{ post.author.avatar }}"
  bio="{{ post.author.bio }}"
/>
```

---

## 特殊变量和函数

### 全局变量

```vt
<!-- 站点信息 -->
{{ site.title }}
{{ site.description }}
{{ site.url }}
{{ site.language }}

<!-- 页面信息 -->
{{ page.title }}
{{ page.url }}
{{ page.description }}

<!-- 当前用户 -->
{{ user.id }}
{{ user.name }}
{{ user.email }}
{{ user.role }}

<!-- 主题配置 -->
{{ theme.config.colors.primary }}
{{ theme.settings.showSidebar }}

<!-- 分页信息 -->
{{ pagination.current }}
{{ pagination.total }}
{{ pagination.hasNext }}
{{ pagination.hasPrev }}
```

### 内置函数

```vt
<!-- 路由生成 -->
<a href="{{ url('home') }}">Home</a>
<a href="{{ url('post', { slug: post.slug }) }}">{{ post.title }}</a>
<a href="{{ url('tag', { tag: 'javascript' }) }}">JavaScript</a>

<!-- 资源路径 -->
<link rel="stylesheet" href="{{ asset('css/main.css') }}" />
<img src="{{ asset('images/logo.png') }}" alt="Logo" />

<!-- 国际化 -->
<p>{{ t('welcome_message') }}</p>
<p>{{ t('posts_count', { count: posts.length }) }}</p>
```

---

## 高级特性

### 动态插槽名称

```vt
<!-- 动态插槽 -->
<vt-extends src="layout.vt">
  <vt:slot name="content">
    <vt:if condition="page.layout === 'full'">
      <vt-slot name="{{ page.layout }}" />
    <vt:else />
      <vt-slot name="default" />
    </vt:if>
  </vt-slot>
</vt-extends>
```

### 条件循环

```vt
<!-- 条件循环（仅当条件为真时循环） -->
<vt:each item="post" in="posts" if="post.published">
  <article>{{ post.title }}</article>
</vt:each>
```

### 循环变量

```vt
<vt:each item="post" in="posts" as="loop">
  <div>
    <span>{{ loop.index }}</span> <!-- 从 0 开始 -->
    <span>{{ loop.index1 }}</span> <!-- 从 1 开始 -->
    <span>{{ loop.first }}</span> <!-- 是否第一个 -->
    <span>{{ loop.last }}</span> <!-- 是否最后一个 -->
    <span>{{ loop.even }}</span> <!-- 是否偶数 -->
    <span>{{ loop.odd }}</span> <!-- 是否奇数 -->
  </div>
</vt:each>
```

### 原始 HTML 块

```vt
<!-- 原始 HTML 块（不解析模板语法） -->
<vt:raw>
  <div>
    {{ 这不会被解析 }}
  </div>
</vt:raw>
```

---

## TypeScript 集成

### 类型定义

```typescript
// packages/template-lang/types.ts
interface PageData {
  site: {
    title: string
    description: string
    url: string
    language: string
  }
  page: {
    title: string
    url: string
    description: string
    layout?: string
  }
  posts?: Array<{
    id: string
    title: string
    slug: string
    excerpt: string
    content: string
    publishedAt: Date
    coverImage?: string
    author?: Author
    tags?: Array<Tag>
  }>
  pagination?: {
    current: number
    total: number
    hasNext: boolean
    hasPrev: boolean
    prevUrl?: string
    nextUrl?: string
  }
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  theme: {
    config: ThemeConfig
    settings: Record<string, any>
  }
}
```

### 类型检查

```typescript
// 编译时类型检查
const template = await compileTemplate<{ posts: Post[] }>('home.vt')
// TypeScript 会检查传入的数据类型
```

---

## 最佳实践

### 1. 保持模板简单

```vt
<!-- ✅ 好：逻辑简单 -->
<vt:each item="post" in="posts">
  <article>{{ post.title }}</article>
</vt:each>

<!-- ❌ 不好：复杂逻辑应该在业务层处理 -->
<vt:each item="post" in="posts">
  <vt:if condition="post.published && post.author.active && post.tags.includes('featured')">
    <vt:if condition="post.comments.length > 10">
      <article class="hot">{{ post.title }}</article>
    </vt:if>
  </vt:if>
</vt:each>
```

### 2. 使用组件复用

```vt
<!-- 定义可复用组件 -->
<vt:block id="post-card">
  <article class="post-card">
    <img src="{{ post.image }}" alt="{{ post.title }}" />
    <h2>{{ post.title }}</h2>
  </article>
</vt:block>

<!-- 多次使用 -->
<vt:each item="post" in="posts">
  <vt:embed src="post-card" data="{ post: post }" />
</vt:each>
```

### 3. 始终转义输出

```vt
<!-- ✅ 好：自动转义 -->
<p>{{ user.name }}</p>

<!-- ❌ 避免：除非绝对信任内容 -->
<p>{{{ user.bio }}}</p>
```

### 4. 使用语义化标签

```vt
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <article>
      <header>
        <h1>{{ post.title }}</h1>
        <time datetime="{{ post.publishedAt | date('ISO') }}">
          {{ post.publishedAt | date('YYYY-MM-DD') }}
        </time>
      </header>

      <div class="content">
        {{ post.content | markdown }}
      </div>

      <footer>
        <vt:if condition="post.tags">
          <div class="tags">
            <vt:each item="tag" in="post.tags">
              <a href="{{ tag.url }}">{{ tag.name }}</a>
            </vt:each>
          </div>
        </vt:if>
      </footer>
    </article>
  </vt-slot>
</vt-extends>
```

### 5. 性能优化

```vt
<!-- ✅ 好：使用组件懒加载 -->
<vt:component name="LazyComments" postId="{{ post.id }}" />

<!-- ✅ 好：图片懒加载 -->
<vt-image src="{{ post.image }}" loading="lazy" />

<!-- ❌ 避免：在模板中进行复杂计算 -->
<vt:if condition="calculateComplexMetric(post) > 100">
  ...
</vt:if>
```

---

## 示例主题模板

### 首页模板

```vt
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <!-- Hero Section -->
    <section class="hero">
      <h1>{{ site.title }}</h1>
      <p>{{ site.description }}</p>
    </section>

    <!-- Featured Posts -->
    <section class="featured">
      <h2>Featured Posts</h2>
      <div class="grid">
        <vt:each item="post" in="featuredPosts">
          <article class="post-card featured">
            <img src="{{ post.coverImage }}" alt="{{ post.title }}" />
            <h3>{{ post.title }}</h3>
            <p>{{ post.excerpt | truncate(150) }}</p>
            <a href="{{ post.url }}">Read more</a>
          </article>
        </vt:each>
      </div>
    </section>

    <!-- Recent Posts -->
    <section class="recent">
      <h2>Recent Posts</h2>
      <div class="grid">
        <vt:each item="post" in="recentPosts">
          <article class="post-card">
            <h3>{{ post.title }}</h3>
            <time>{{ post.publishedAt | date('MMM DD, YYYY') }}</time>
            <p>{{ post.excerpt | truncate(100) }}</p>
            <a href="{{ post.url }}">Read more</a>
          </article>
        </vt:each>
      </div>

      <!-- Pagination -->
      <vt-pagination
        current="{{ pagination.current }}"
        total="{{ pagination.total }}"
        prevUrl="{{ pagination.prevUrl }}"
        nextUrl="{{ pagination.nextUrl }}"
      />
    </section>
  </vt-slot>
</vt-extends>
```

### 文章详情页模板

```vt
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <article class="post">
      <header>
        <h1>{{ post.title }}</h1>
        <div class="meta">
          <time>{{ post.publishedAt | date('MMMM DD, YYYY') }}</time>
          <span>By {{ post.author.name }}</span>
          <vt:if condition="post.readingTime">
            <span>{{ post.readingTime }} min read</span>
          </vt:if>
        </div>

        <!-- Tags -->
        <vt:if condition="post.tags && post.tags.length > 0">
          <div class="tags">
            <vt:each item="tag" in="post.tags">
              <a href="{{ tag.url }}" class="tag">{{ tag.name }}</a>
            </vt:each>
          </div>
        </vt:if>
      </header>

      <!-- Featured Image -->
      <vt:if condition="post.coverImage">
        <img src="{{ post.coverImage }}" alt="{{ post.title }}" class="cover" />
      </vt:if>

      <!-- Video -->
      <vt:if condition="post.video">
        <div class="video-wrapper">
          <vt-video
            url="{{ post.video.url }}"
            platform="{{ post.video.platform }}"
          />
        </div>
      </vt:if>

      <!-- Content -->
      <div class="content">
        {{ post.content | markdown }}
      </div>

      <!-- Code Snippets -->
      <vt:if condition="post.snippets && post.snippets.length > 0">
        <section class="snippets">
          <h2>Code Snippets</h2>
          <vt:each item="snippet" in="post.snippets">
            <div class="snippet">
              <h4>{{ snippet.title }}</h4>
              <vt-code language="{{ snippet.language }}">
                {{ snippet.code }}
              </vt-code>
            </div>
          </vt:each>
        </section>
      </vt:if>

      <footer>
        <!-- Share Buttons -->
        <div class="share">
          <a href="https://twitter.com/intent/tweet?url={{ page.url | urlEncode }}&text={{ post.title | urlEncode }}">
            Share on Twitter
          </a>
          <a href="https://www.facebook.com/sharer/sharer.php?u={{ page.url | urlEncode }}">
            Share on Facebook
          </a>
        </div>

        <!-- Related Posts -->
        <vt:if condition="relatedPosts && relatedPosts.length > 0">
          <section class="related">
            <h3>Related Posts</h3>
            <ul>
              <vt:each item="relatedPost" in="relatedPosts">
                <li>
                  <a href="{{ relatedPost.url }}">{{ relatedPost.title }}</a>
                </li>
              </vt:each>
            </ul>
          </section>
        </vt:if>
      </footer>
    </article>
  </vt-slot>
</vt-extends>
```

---

## 实现细节参考

### 编译流程

1. **词法分析（Lexer）**：将模板字符串转换为 tokens
2. **语法分析（Parser）**：将 tokens 转换为 AST
3. **代码生成（Code Generator）**：将 AST 转换为 React 组件代码
4. **编译**：将生成的代码编译为 JavaScript
5. **缓存**：将编译后的组件缓存

### 性能考虑

- 编译后的组件缓存（Vercel KV）
- 开发环境支持热更新
- 生产环境使用 SSG/ISR
- 支持服务端流式渲染（Streaming SSR）

---

## 更多资源

- [模板语言 API 参考](./api/template-language.md)
- [主题开发指南](./theme-development.md)
- [自定义组件开发](./custom-components.md)
- [过滤器开发指南](./filter-development.md)
