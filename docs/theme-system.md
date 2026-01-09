# VeloCMS 主题系统设计

## 概述

VeloCMS 主题系统是整个平台的核心功能，允许用户灵活地定制网站外观和布局。系统基于标准模板语言（VT），提供强大的主题切换、配置和扩展能力。

**核心特性**：
- ✅ 标准模板语言支持
- ✅ 主题配置系统
- ✅ 实时预览
- ✅ 热更新支持
- ✅ 主题验证机制
- ✅ 多主题共存
- ✅ 自定义组件支持
- ✅ 主题继承和扩展

---

## 主题结构

### 标准主题目录结构

```
theme-name/
├── theme.config.json          # 主题配置文件
├── theme.config.ts            # 可选：TypeScript 配置增强
├── package.json               # 主题元数据和依赖
├── README.md                  # 主题说明文档
├── LICENSE                    # 许可证
│
├── templates/                 # 模板文件目录
│   ├── layout.vt              # 基础布局
│   ├── home.vt                # 首页
│   ├── post.vt                # 文章详情页
│   ├── page.vt                # 自定义页面
│   ├── archive.vt             # 归档页
│   ├── tag.vt                 # 标签页
│   ├── category.vt            # 分类页
│   ├── search.vt              # 搜索页
│   ├── 404.vt                 # 404 页面
│   ├── header.vt              # 页头组件
│   ├── footer.vt              # 页脚组件
│   ├── sidebar.vt             # 侧边栏
│   └── partials/              # 部分模板
│       ├── post-card.vt
│       ├── pagination.vt
│       └── comments.vt
│
├── assets/                    # 静态资源
│   ├── css/
│   │   ├── main.css           # 主样式
│   │   ├── variables.css      # CSS 变量
│   │   └── components.css     # 组件样式
│   ├── js/
│   │   ├── main.js            # 主脚本
│   │   └── theme.js           # 主题初始化脚本
│   ├── images/
│   │   ├── logo.png
│   │   ├── favicon.ico
│   │   └── icons/
│   └── fonts/
│       └── custom-font.woff2
│
├── components/                # 自定义 React 组件（可选）
│   ├── PostCard.tsx
│   ├── NewsletterForm.tsx
│   └── VideoPlayer.tsx
│
├── locales/                   # 国际化文件（可选）
│   ├── en.json
│   └── zh.json
│
└── screenshots/               # 主题截图（用于主题市场）
    ├── home.png
    ├── post.png
    └── settings.png
```

---

## 主题配置

### theme.config.json

```json
{
  "name": "modern-blog",
  "version": "1.2.0",
  "author": {
    "name": "Theme Author",
    "email": "author@example.com",
    "website": "https://example.com"
  },
  "license": "MIT",
  "description": "A modern, clean blog theme for VeloCMS",
  "keywords": ["blog", "modern", "clean", "responsive"],
  "screenshot": "screenshot.png",
  "minVeloCMSVersion": "1.0.0",

  "config": {
    "colors": {
      "primary": "#0070f3",
      "secondary": "#7928ca",
      "accent": "#ff0080",
      "background": "#ffffff",
      "surface": "#f8f9fa",
      "text": "#1a1a1a",
      "text-secondary": "#666666",
      "border": "#e5e7eb",
      "success": "#10b981",
      "warning": "#f59e0b",
      "error": "#ef4444"
    },
    "fonts": {
      "heading": {
        "family": "Inter",
        "weight": [400, 600, 700],
        "size": {
          "h1": "2.5rem",
          "h2": "2rem",
          "h3": "1.5rem",
          "h4": "1.25rem",
          "h5": "1.125rem",
          "h6": "1rem"
        }
      },
      "body": {
        "family": "Inter",
        "weight": [400, 500],
        "size": "1rem"
      },
      "code": {
        "family": "JetBrains Mono",
        "size": "0.875rem"
      }
    },
    "spacing": {
      "unit": "0.25rem",
      "container": "1200px",
      "section": "4rem"
    },
    "layout": {
      "maxWidth": "1200px",
      "sidebar": true,
      "sidebarPosition": "right",
      "header": {
        "sticky": true,
        "transparent": false,
        "showLogo": true,
        "showNavigation": true,
        "showSearch": true
      },
      "footer": {
        "columns": 3,
        "showSocialLinks": true
      }
    },
    "features": {
      "darkMode": true,
      "readingProgress": true,
      "tableOfContents": true,
      "relatedPosts": true,
      "comments": true,
      "newsletter": true
    },
    "seo": {
      "openGraph": true,
      "twitterCard": true,
      "structuredData": true
    }
  },

  "templates": {
    "layout": "templates/layout.vt",
    "home": "templates/home.vt",
    "post": "templates/post.vt",
    "page": "templates/page.vt",
    "archive": "templates/archive.vt",
    "tag": "templates/tag.vt",
    "category": "templates/category.vt",
    "search": "templates/search.vt",
    "404": "templates/404.vt"
  },

  "assets": {
    "css": [
      "assets/css/variables.css",
      "assets/css/main.css"
    ],
    "js": [
      "assets/js/theme.js"
    ]
  },

  "settings": [
    {
      "key": "showSidebar",
      "type": "boolean",
      "default": true,
      "label": "Show Sidebar",
      "description": "Display sidebar on blog pages",
      "category": "Layout"
    },
    {
      "key": "sidebarPosition",
      "type": "select",
      "default": "right",
      "label": "Sidebar Position",
      "options": ["left", "right"],
      "category": "Layout"
    },
    {
      "key": "primaryColor",
      "type": "color",
      "default": "#0070f3",
      "label": "Primary Color",
      "category": "Appearance"
    },
    {
      "key": "fontScale",
      "type": "range",
      "min": 0.8,
      "max": 1.2,
      "step": 0.1,
      "default": 1,
      "label": "Font Scale",
      "category": "Appearance"
    },
    {
      "key": "postsPerPage",
      "type": "number",
      "min": 5,
      "max": 50,
      "default": 10,
      "label": "Posts Per Page",
      "category": "Content"
    },
    {
      "key": "showRelatedPosts",
      "type": "boolean",
      "default": true,
      "label": "Show Related Posts",
      "category": "Content"
    },
    {
      "key": "newsletterTitle",
      "type": "text",
      "default": "Subscribe to my newsletter",
      "label": "Newsletter Title",
      "category": "Newsletter"
    }
  ],

  "customComponents": [
    {
      "name": "NewsletterForm",
      "component": "components/NewsletterForm",
      "props": {
        "title": {
          "type": "string",
          "default": "Subscribe"
        },
        "showName": {
          "type": "boolean",
          "default": true
        }
      }
    }
  ],

  "filters": [
    {
      "name": "youtubeEmbed",
      "file": "filters/youtube.ts"
    }
  ],

  "hooks": {
    "onInit": "hooks/onInit.ts",
    "beforeRender": "hooks/beforeRender.ts",
    "afterRender": "hooks/afterRender.ts"
  }
}
```

---

## 主题加载机制

### 加载流程

```
1. 主题注册
   ↓ 扫描 themes/ 目录
   ↓ 解析 theme.config.json
   ↓ 验证主题结构
   ↓ 注册到主题注册表

2. 主题激活
   ↓ 从数据库读取用户主题设置
   ↓ 加载主题配置
   ↓ 合并用户自定义配置
   ↓ 预编译模板

3. 模板编译
   ↓ 读取模板文件
   ↓ 使用 VT 编译器编译
   ↓ 生成 React 组件
   ↓ 缓存到 KV/Redis

4. 资源加载
   ↓ 加载 CSS/JS 文件
   ↓ 处理图片等静态资源
   ↓ 按需加载组件

5. 渲染
   ↓ 结合页面数据
   ↓ 执行主题 hooks
   ↓ 渲染为 HTML
```

### 主题注册实现

```typescript
// packages/theme-system/registry.ts
import { z } from 'zod'

const ThemeConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string().optional(),
    website: z.string().optional()
  }),
  description: z.string(),
  config: z.object({
    colors: z.record(z.string()).optional(),
    fonts: z.any().optional(),
    layout: z.any().optional()
  }),
  templates: z.record(z.string()),
  assets: z.object({
    css: z.array(z.string()),
    js: z.array(z.string())
  }),
  settings: z.array(z.any()).optional()
})

class ThemeRegistry {
  private themes = new Map<string, Theme>()
  private activeTheme: string | null = null

  async registerTheme(themePath: string): Promise<Theme> {
    // 1. 读取配置文件
    const configPath = path.join(themePath, 'theme.config.json')
    const configContent = await fs.readFile(configPath, 'utf-8')
    const config = ThemeConfigSchema.parse(JSON.parse(configContent))

    // 2. 验证主题结构
    await this.validateThemeStructure(themePath, config)

    // 3. 创建主题对象
    const theme: Theme = {
      ...config,
      path: themePath,
      templates: {},
      components: {}
    }

    // 4. 加载模板
    await this.loadTemplates(theme)

    // 5. 注册主题
    this.themes.set(config.name, theme)

    return theme
  }

  async loadAllThemes(themesDir: string): Promise<void> {
    const entries = await fs.readdir(themesDir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const themePath = path.join(themesDir, entry.name)
        await this.registerTheme(themePath)
      }
    }
  }

  async activateTheme(themeName: string): Promise<void> {
    const theme = this.themes.get(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    // 预编译模板
    await this.precompileTemplates(theme)

    this.activeTheme = themeName
  }

  getActiveTheme(): Theme | null {
    if (!this.activeTheme) return null
    return this.themes.get(this.activeTheme) || null
  }

  getTheme(name: string): Theme | undefined {
    return this.themes.get(name)
  }

  listThemes(): Theme[] {
    return Array.from(this.themes.values())
  }

  private async validateThemeStructure(themePath: string, config: any): Promise<void> {
    // 验证必需的模板文件
    for (const [key, templatePath] of Object.entries(config.templates)) {
      const fullPath = path.join(themePath, templatePath)
      if (!await fs.pathExists(fullPath)) {
        throw new Error(`Missing template: ${templatePath}`)
      }
    }

    // 验证资源文件
    for (const cssFile of config.assets.css) {
      const fullPath = path.join(themePath, cssFile)
      if (!await fs.pathExists(fullPath)) {
        throw new Error(`Missing CSS file: ${cssFile}`)
      }
    }
  }

  private async loadTemplates(theme: Theme): Promise<void> {
    const templatesDir = path.join(theme.path, 'templates')
    const entries = await fs.readdir(templatesDir)

    for (const entry of entries) {
      if (entry.endsWith('.vt')) {
        const templatePath = path.join(templatesDir, entry)
        const content = await fs.readFile(templatePath, 'utf-8')
        theme.templates[entry] = content
      }
    }
  }

  private async precompileTemplates(theme: Theme): Promise<void> {
    const compiler = new TemplateCompiler()

    for (const [name, content] of Object.entries(theme.templates)) {
      const component = await compiler.compile(content)
      theme.compiledTemplates = theme.compiledTemplates || {}
      theme.compiledTemplates[name] = component
    }
  }
}

export const themeRegistry = new ThemeRegistry()
```

---

## 主题验证

### 验证规则

```typescript
// packages/theme-system/validator.ts
import { z } from 'zod'

class ThemeValidator {
  async validateTheme(themePath: string): Promise<ValidationResult> {
    const errors: ValidationError[] = []

    try {
      // 1. 检查配置文件
      await this.validateConfigFile(themePath, errors)

      // 2. 检查目录结构
      await this.validateDirectoryStructure(themePath, errors)

      // 3. 检查模板文件
      await this.validateTemplates(themePath, errors)

      // 4. 检查资源文件
      await this.validateAssets(themePath, errors)

      // 5. 检查组件文件
      await this.validateComponents(themePath, errors)

      return {
        valid: errors.length === 0,
        errors
      }
    } catch (error) {
      return {
        valid: false,
        errors: [{
          field: 'general',
          message: error.message
        }]
      }
    }
  }

  private async validateConfigFile(themePath: string, errors: ValidationError[]): Promise<void> {
    const configPath = path.join(themePath, 'theme.config.json')

    if (!await fs.pathExists(configPath)) {
      errors.push({
        field: 'config',
        message: 'theme.config.json is required'
      })
      return
    }

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

      // 验证必需字段
      const requiredFields = ['name', 'version', 'author', 'description', 'templates']
      for (const field of requiredFields) {
        if (!config[field]) {
          errors.push({
            field,
            message: `Missing required field: ${field}`
          })
        }
      }

      // 验证版本号格式
      if (!semver.valid(config.version)) {
        errors.push({
          field: 'version',
          message: 'Invalid version format. Use semver (e.g., 1.0.0)'
        })
      }

      // 验证模板路径
      for (const [key, templatePath] of Object.entries(config.templates)) {
        if (typeof templatePath !== 'string') {
          errors.push({
            field: `templates.${key}`,
            message: 'Template path must be a string'
          })
        }
      }

      // 验证设置定义
      if (config.settings) {
        for (const setting of config.settings) {
          if (!setting.key || !setting.type) {
            errors.push({
              field: 'settings',
              message: 'Each setting must have "key" and "type" fields'
            })
          }
        }
      }
    } catch (error) {
      errors.push({
        field: 'config',
        message: 'Invalid JSON in theme.config.json'
      })
    }
  }

  private async validateDirectoryStructure(themePath: string, errors: ValidationError[]): Promise<void> {
    const requiredDirs = ['templates']
    for (const dir of requiredDirs) {
      const dirPath = path.join(themePath, dir)
      if (!await fs.pathExists(dirPath)) {
        errors.push({
          field: 'structure',
          message: `Missing required directory: ${dir}/`
        })
      }
    }
  }

  private async validateTemplates(themePath: string, errors: ValidationError[]): Promise<void> {
    const configPath = path.join(themePath, 'theme.config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    for (const [key, templatePath] of Object.entries(config.templates)) {
      const fullPath = path.join(themePath, templatePath)

      if (!await fs.pathExists(fullPath)) {
        errors.push({
          field: `templates.${key}`,
          message: `Template file not found: ${templatePath}`
        })
        continue
      }

      // 检查模板语法
      try {
        const content = await fs.readFile(fullPath, 'utf-8')
        const lexer = new TemplateLexer()
        const parser = new TemplateParser()

        const tokens = lexer.tokenize(content)
        parser.parse(tokens)
      } catch (error) {
        errors.push({
          field: `templates.${key}`,
          message: `Template syntax error: ${error.message}`
        })
      }
    }
  }

  private async validateAssets(themePath: string, errors: ValidationError[]): Promise<void> {
    const configPath = path.join(themePath, 'theme.config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    if (config.assets) {
      // 验证 CSS 文件
      if (config.assets.css) {
        for (const cssFile of config.assets.css) {
          const fullPath = path.join(themePath, cssFile)
          if (!await fs.pathExists(fullPath)) {
            errors.push({
              field: 'assets.css',
              message: `CSS file not found: ${cssFile}`
            })
          }
        }
      }

      // 验证 JS 文件
      if (config.assets.js) {
        for (const jsFile of config.assets.js) {
          const fullPath = path.join(themePath, jsFile)
          if (!await fs.pathExists(fullPath)) {
            errors.push({
              field: 'assets.js',
              message: `JS file not found: ${jsFile}`
            })
          }
        }
      }
    }
  }

  private async validateComponents(themePath: string, errors: ValidationError[]): Promise<void> {
    const configPath = path.join(themePath, 'theme.config.json')
    const config = JSON.parse(await fs.readFile(configPath, 'utf-8'))

    if (config.customComponents) {
      const componentsDir = path.join(themePath, 'components')

      if (!await fs.pathExists(componentsDir)) {
        errors.push({
          field: 'components',
          message: 'Components directory is required when customComponents are defined'
        })
        return
      }

      for (const component of config.customComponents) {
        const componentPath = path.join(themePath, component.component + '.tsx')

        if (!await fs.pathExists(componentPath)) {
          errors.push({
            field: `components.${component.name}`,
            message: `Component file not found: ${component.component}.tsx`
          })
        }
      }
    }
  }
}

export const themeValidator = new ThemeValidator()
```

---

## 主题配置系统

### 配置合并策略

```typescript
// packages/theme-system/config.ts
class ThemeConfigManager {
  async getThemeConfig(themeName: string, userSettings?: Record<string, any>): Promise<ThemeConfig> {
    // 1. 获取主题基础配置
    const theme = themeRegistry.getTheme(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    // 2. 深度克隆基础配置
    const config = deepClone(theme.config)

    // 3. 合并用户自定义配置
    if (userSettings) {
      config.userSettings = { ...config.userSettings, ...userSettings }
    }

    // 4. 应用主题设置
    this.applySettings(config)

    return config
  }

  private applySettings(config: ThemeConfig): void {
    const settings = config.userSettings || {}

    // 应用颜色设置
    if (settings.primaryColor) {
      config.colors.primary = settings.primaryColor
    }

    // 应用布局设置
    if (settings.showSidebar !== undefined) {
      config.layout.sidebar = settings.showSidebar
    }

    if (settings.sidebarPosition) {
      config.layout.sidebarPosition = settings.sidebarPosition
    }

    // 应用字体缩放
    if (settings.fontScale) {
      const scale = settings.fontScale
      config.fonts.body.size = `calc(1rem * ${scale})`
      for (const key in config.fonts.heading.size) {
        const baseSize = parseFloat(config.fonts.heading.size[key])
        config.fonts.heading.size[key] = `${baseSize * scale}rem`
      }
    }
  }

  async updateUserTheme(userId: string, themeName: string, settings: Record<string, any>): Promise<void> {
    // 保存到数据库
    await db.userSettings.upsert({
      where: { userId },
      create: {
        userId,
        themeName,
        settings
      },
      update: {
        themeName,
        settings
      }
    })

    // 清除缓存
    await this.clearUserConfigCache(userId)
  }

  private async clearUserConfigCache(userId: string): Promise<void> {
    const cacheKey = `user:config:${userId}`
    await kv.del(cacheKey)
  }
}

export const themeConfigManager = new ThemeConfigManager()
```

---

## 主题继承与扩展

### 父子主题机制

```typescript
// packages/theme-system/inheritance.ts
class ThemeInheritance {
  async loadThemeWithParents(themeName: string): Promise<ResolvedTheme> {
    const theme = themeRegistry.getTheme(themeName)
    if (!theme) {
      throw new Error(`Theme "${themeName}" not found`)
    }

    return this.resolveTheme(theme)
  }

  private async resolveTheme(theme: Theme, visited = new Set<string>()): Promise<ResolvedTheme> {
    if (visited.has(theme.name)) {
      throw new Error(`Circular theme dependency detected: ${Array.from(visited).join(' -> ')} -> ${theme.name}`)
    }

    visited.add(theme.name)

    let resolved: ResolvedTheme = {
      name: theme.name,
      config: deepClone(theme.config),
      templates: {},
      components: {},
      filters: {},
      assets: deepClone(theme.assets)
    }

    // 如果有父主题，先解析父主题
    if (theme.extends) {
      const parentTheme = themeRegistry.getTheme(theme.extends)
      if (parentTheme) {
        resolved = await this.resolveTheme(parentTheme, visited)
      }
    }

    // 合并当前主题的配置
    resolved.config = this.mergeConfigs(resolved.config, theme.config)

    // 合并模板（子主题覆盖父主题）
    resolved.templates = {
      ...resolved.templates,
      ...theme.templates
    }

    // 合并组件
    resolved.components = {
      ...resolved.components,
      ...theme.components
    }

    // 合并过滤器
    resolved.filters = {
      ...resolved.filters,
      ...theme.filters
    }

    // 合并资源（去重）
    resolved.assets.css = [...new Set([...resolved.assets.css, ...theme.assets.css])]
    resolved.assets.js = [...new Set([...resolved.assets.js, ...theme.assets.js])]

    return resolved
  }

  private mergeConfigs(base: any, override: any): any {
    return deepMerge(base, override)
  }
}

export const themeInheritance = new ThemeInheritance()
```

---

## 主题 API

### 获取主题列表

```typescript
GET /api/themes
Response: {
  themes: [
    {
      name: string
      version: string
      description: string
      author: {
        name: string
        website?: string
      }
      screenshot?: string
    }
  ]
}
```

### 获取主题详情

```typescript
GET /api/themes/:name
Response: {
  name: string
  version: string
  description: string
  author: object
  config: object
  templates: string[]
  settings: ThemeSetting[]
  screenshots: string[]
}
```

### 激活主题

```typescript
POST /api/user/theme
Body: {
  themeName: string
  settings?: Record<string, any>
}
```

### 预览主题

```typescript
GET /api/themes/:name/preview?pageType=home&previewToken=xxx
```

### 上传主题

```typescript
POST /api/themes/upload
Content-Type: multipart/form-data
Body: {
  theme: File (zip file)
}
```

---

## 性能优化

### 1. 模板缓存

```typescript
// 缓存编译后的模板
async getCachedTemplate(themeName: string, templateName: string): Promise<React.ComponentType> {
  const cacheKey = `template:${themeName}:${templateName}`

  // 尝试从 KV 获取
  const cached = await kv.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // 编译并缓存
  const theme = themeRegistry.getTheme(themeName)
  const template = await compiler.compile(theme.templates[templateName])

  await kv.set(cacheKey, JSON.stringify(template), { ex: 86400 }) // 24 小时过期

  return template
}
```

### 2. 资源优化

- CSS/JS 文件压缩和哈希化
- 图片自动优化（WebP/AVIF）
- CDN 分发（Vercel Edge Network）

### 3. 开发环境热更新

```typescript
// 监听主题文件变化
watch(themesDir, async (event, filename) => {
  if (filename.endsWith('.vt')) {
    // 清除模板缓存
    await kv.del(`template:*`)
    // 触发浏览器热更新
    hmr.update('/api/hmr')
  }
})
```

---

## 安全考虑

1. **沙箱执行**：模板在受限环境中执行，防止访问危险 API
2. **内容安全策略**：设置 CSP 头
3. **主题验证**：上传前验证主题结构
4. **权限控制**：只有管理员可以上传主题
5. **依赖检查**：限制主题可以使用的外部依赖

---

## 示例主题

### Minimal 主题

```vt
<!-- templates/layout.vt -->
<vt-layout>
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{ page.title }}</title>
      <vt:each item="css" in="theme.assets.css">
        <link rel="stylesheet" href="{{ asset(css) }}" />
      </vt:each>
    </head>
    <body>
      <main>
        <vt-slot name="content" />
      </main>
    </body>
  </html>
</vt-layout>

<!-- templates/home.vt -->
<vt-extends src="layout.vt">
  <vt-slot name="content">
    <vt:each item="post" in="posts">
      <article>
        <h2>{{ post.title }}</h2>
        <time>{{ post.publishedAt | date }}</time>
        <p>{{ post.excerpt }}</p>
        <a href="{{ post.url }}">Read</a>
      </article>
    </vt:each>
  </vt-slot>
</vt-extends>
```

---

## 主题开发工具

### CLI 工具

```bash
# 创建新主题
npx velocms-cli theme create my-theme

# 验证主题
npx velocms-cli theme validate ./my-theme

# 打包主题
npx velocms-cli theme build ./my-theme

# 预览主题
npx velocms-cli theme preview ./my-theme
```

### VS Code 插件

- 语法高亮
- 智能提示
- 实时预览
- 错误检查

---

## 未来扩展

- [ ] 主题市场
- [ ] 主题评分系统
- [ ] 一键导入 WordPress 主题
- [ ] 可视化主题编辑器
- [ ] 主题版本管理
- [ ] 主题自动更新

---

## 深色模式支持

每个主题必须同时支持深色和浅色两种模式。

### 配置方式

在 `theme.config.json` 中定义 `colors` 和 `darkColors` 两套配色：

```json
{
  "config": {
    "colors": {
      "primary": "#0070f3",
      "secondary": "#7928ca",
      "accent": "#ff0080",
      "background": "#ffffff",
      "surface": "#f8f9fa",
      "text": "#1a1a1a",
      "text-secondary": "#666666",
      "border": "#e5e7eb"
    },
    "darkColors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6",
      "accent": "#f472b6",
      "background": "#0f172a",
      "surface": "#1e293b",
      "text": "#e2e8f0",
      "text-secondary": "#94a3b8",
      "border": "#334155"
    }
  }
}
```

### CSS 变量规范

| 变量名 | 说明 |
|--------|------|
| `--color-background` | 页面背景色 |
| `--color-surface` | 卡片/容器背景 |
| `--color-text` | 主文本颜色 |
| `--color-text-secondary` | 次要文本 |
| `--color-primary` | 主色调 |
| `--color-secondary` | 次要色调 |
| `--color-accent` | 强调色 |
| `--color-border` | 边框颜色 |
| `--color-success` | 成功色（可选） |
| `--color-warning` | 警告色（可选） |
| `--color-error` | 错误色（可选） |

### CSS 文件要求

主题的 CSS 文件必须包含深色模式样式：

```css
/* 浅色模式 */
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
}

/* 深色模式 */
.dark, .dark-mode {
  --color-background: #0f172a;
  --color-text: #e2e8f0;
}

/* 系统偏好 */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.light-mode) {
    --color-background: #0f172a;
    --color-text: #e2e8f0;
  }
}

/* 使用变量 */
body {
  background: var(--color-background);
  color: var(--color-text);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 主题验证

系统会自动检查主题是否提供深色模式配置。未提供 `darkColors` 的主题将被标记为不支持深色模式。

### 相关文档

详细开发指南请参考 [深色模式适配指南](/docs/dark-mode.md)。
