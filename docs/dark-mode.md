# 深色模式适配指南

## 概述

VeloCMS 主题系统原生支持深色/浅色模式切换。每个主题必须同时提供浅色和深色两套配色方案。

## 实现机制

### 1. CSS 变量 + class 切换

系统使用 CSS 变量定义颜色，并通过 `next-themes` 自动切换 `.dark` class：

```css
/* 浅色模式 - :root */
:root {
  --color-background: #ffffff;
  --color-text: #1a1a1a;
}

/* 深色模式 - .dark 或 .dark-mode class */
.dark, .dark-mode {
  --color-background: #0f172a;
  --color-text: #e2e8f0;
}

/* 系统偏好深色模式 */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.light-mode) {
    --color-background: #0f172a;
    --color-text: #e2e8f0;
  }
}
```

### 2. 主题配置

在 `theme.config.json` 中定义两套颜色：

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

## 颜色变量规范

### 必须定义的颜色

| 变量名 | 说明 | 浅色示例 | 深色示例 |
|--------|------|----------|----------|
| `--color-background` | 页面背景色 | `#ffffff` | `#0f172a` |
| `--color-surface` | 卡片/容器背景 | `#f8f9fa` | `#1e293b` |
| `--color-text` | 主文本颜色 | `#1a1a1a` | `#e2e8f0` |
| `--color-text-secondary` | 次要文本 | `#666666` | `#94a3b8` |
| `--color-primary` | 主色调 | `#0070f3` | `#3b82f6` |
| `--color-secondary` | 次要色调 | `#7928ca` | `#8b5cf6` |
| `--color-accent` | 强调色 | `#ff0080` | `#f472b6` |
| `--color-border` | 边框颜色 | `#e5e7eb` | `#334155` |

### 可选颜色

| 变量名 | 说明 |
|--------|------|
| `--color-success` | 成功状态色 |
| `--color-warning` | 警告状态色 |
| `--color-error` | 错误状态色 |

## 主题开发规范

### 1. CSS 文件编写

**必须使用 CSS 变量**，禁止使用硬编码颜色：

```css
/* ❌ 错误：硬编码颜色 */
body {
  background: #ffffff;
  color: #1a1a1a;
}

/* ✅ 正确：使用 CSS 变量 */
body {
  background: var(--color-background);
  color: var(--color-text);
}
```

### 2. 深色模式样式

所有需要适配深色的样式都必须使用变量：

```css
/* ✅ 正确 */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

/* ✅ 支持 hover 状态 */
.button {
  background: var(--color-primary);
  color: white;
}

.button:hover {
  opacity: 0.9;
}

/* ✅ 表单元素 */
input, textarea, select {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
```

### 3. 过渡动画

建议为颜色变化添加过渡效果：

```css
body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

a, button {
  transition: color 0.2s ease, background-color 0.2s ease;
}
```

## 示例主题配置

### 完整 theme.config.json

```json
{
  "name": "my-theme",
  "version": "1.0.0",
  "description": "我的主题 - 支持深色模式",
  
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
    "darkColors": {
      "primary": "#3b82f6",
      "secondary": "#8b5cf6",
      "accent": "#f472b6",
      "background": "#0f172a",
      "surface": "#1e293b",
      "text": "#e2e8f0",
      "text-secondary": "#94a3b8",
      "border": "#334155",
      "success": "#34d399",
      "warning": "#fbbf24",
      "error": "#f87171"
    },
    "fonts": {
      "heading": { "family": "Inter", "weight": [400, 600, 700] },
      "body": { "family": "Inter", "weight": [400, 500] },
      "code": { "family": "JetBrains Mono" }
    },
    "layout": {
      "maxWidth": "1200px"
    }
  },
  
  "templates": {
    "layout": "templates/layout.vt",
    "home": "templates/home.vt",
    "post": "templates/post.vt"
  },
  
  "assets": {
    "css": ["assets/css/main.css"],
    "js": ["assets/js/theme.js"]
  }
}
```

### 完整 CSS 文件

```css
/* 浅色模式 */
:root {
  --color-primary: #0070f3;
  --color-secondary: #7928ca;
  --color-accent: #ff0080;
  --color-background: #ffffff;
  --color-surface: #f8f9fa;
  --color-text: #1a1a1a;
  --color-text-secondary: #666666;
  --color-border: #e5e7eb;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
}

/* 深色模式 */
.dark, .dark-mode {
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-accent: #f472b6;
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-border: #334155;
  --color-success: #34d399;
  --color-warning: #fbbf24;
  --color-error: #f87171;
}

/* 系统偏好深色 */
@media (prefers-color-scheme: dark) {
  :root:not(.light):not(.light-mode) {
    --color-primary: #3b82f6;
    --color-secondary: #8b5cf6;
    --color-accent: #f472b6;
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #e2e8f0;
    --color-text-secondary: #94a3b8;
    --color-border: #334155;
    --color-success: #34d399;
    --color-warning: #fbbf24;
    --color-error: #f87171;
  }
}

/* 基础样式 */
body {
  font-family: var(--font-body, sans-serif);
  color: var(--color-text);
  background: var(--color-background);
  transition: background-color 0.3s ease, color 0.3s ease;
}

a {
  color: var(--color-primary);
}

button {
  background: var(--color-primary);
  color: white;
}

/* 组件样式 */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

input, textarea, select {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}
```

## 验证深色模式

1. 启动开发服务器：`npm run dev`
2. 打开浏览器开发者工具
3. 切换深色/浅色模式，观察页面颜色变化
4. 测试系统偏好设置（macOS: System Preferences > Appearance）

## 常见问题

### 1. 颜色不生效？

确保：
- CSS 变量定义在 `:root` 和 `.dark` 中
- 使用 `var(--color-xxx)` 引用变量
- 检查变量名称拼写

### 2. 闪烁问题？

`next-themes` 的 `suppressHydrationWarning` 属性可以防止闪烁。

### 3. 深色模式切换后部分颜色不变？

可能的原因：
- 使用了硬编码颜色
- CSS 选择器优先级问题
- 第三方组件未使用 CSS 变量

## 最佳实践

1. **优先使用 CSS 变量** - 所有可变的颜色都必须用变量
2. **颜色对比度** - 确保深色模式下文字可读性（WCAG AA 标准）
3. **平滑过渡** - 添加 `transition` 属性避免颜色突变
4. **测试完整** - 测试所有组件在两种模式下的显示
5. **一致性** - 保持深色/浅色模式的视觉层次一致
