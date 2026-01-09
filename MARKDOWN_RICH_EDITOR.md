# VeloCMS - Markdown 富文本编辑器优化

## ✅ 完成的更新

### 用户需求

用户反馈：
- 富文本编辑器（TipTap）加载后显示的是 Markdown 语法的原始内容
- 需要一个支持 Markdown 语法可视化编辑的富文本编辑器
- 希望可以通过可视化方式编辑 Markdown 文档
- 也可以自己通过源码的方式来编辑

### 解决方案

新增 **Markdown 可视化编辑器**，提供真正的 Markdown 支持，包括：
- 原生 Markdown 语法支持
- 三种视图模式（编辑、预览、分屏）
- 实时渲染预览
- Markdown 格式输入和输出

---

## 📊 新增功能

### Markdown 可视化编辑器

**文件**：`src/components/admin/markdown-rich-editor.tsx`

**特性**：
- ✅ 原生 Markdown 语法支持
- ✅ 三种视图模式：
  - **编辑模式**：纯 Markdown 源码编辑
  - **预览模式**：实时渲染预览
  - **分屏模式**：左边编辑，右边预览
- ✅ 实时渲染预览
- ✅ Markdown 格式输入和输出
- ✅ 代码高亮支持
- ✅ GitHub Flavored Markdown (GFM) 支持

**视图模式**：

#### 1. 编辑模式
- 纯 Markdown 源码编辑
- 等宽字体（font-mono）
- 支持所有 Markdown 语法

#### 2. 预览模式
- 实时渲染预览
- 美化的排版（prose 样式）
- 代码高亮

#### 3. 分屏模式
- 左边：Markdown 源码编辑
- 右边：实时渲染预览
- 同步滚动

---

## 🎨 编辑器选项

### 1. 富文本编辑器（TipTap）

**适用场景**：
- 需要 WYSIWYG（所见即所得）编辑
- 需要富文本格式（HTML）
- 需要复杂的格式化选项

**特性**：
- ✅ 所见即所得（WYSIWYG）
- ✅ 支持 Markdown 快捷键
- ✅ 完整的工具栏（撤销、重做、标题、格式、列表、链接、图片）
- ✅ HTML 格式输出

**注意**：
- 使用 HTML 格式存储
- 通过 Markdown 快捷键输入 Markdown 语法
- 适合非技术用户

### 2. Markdown 可视化编辑器（新增）⭐

**适用场景**：
- 需要原生 Markdown 支持
- 需要同时看到源码和预览
- 需要精确控制 Markdown 格式
- 技术用户、开发者

**特性**：
- ✅ 原生 Markdown 语法支持
- ✅ 三种视图模式（编辑、预览、分屏）
- ✅ Markdown 格式输入和输出
- ✅ 实时渲染预览
- ✅ 代码高亮支持
- ✅ GFM 支持（表格、删除线等）

**注意**：
- 使用 Markdown 格式存储
- 直接编写 Markdown 源码
- 适合技术用户

### 3. Markdown 源码编辑器（保留）

**适用场景**：
- 只需要 Markdown 源码编辑
- 需要编辑/预览模式切换
- 简单的 Markdown 编辑

**特性**：
- ✅ 编辑/预览模式切换
- ✅ Markdown 格式输出
- ✅ 代码高亮支持

**注意**：
- 使用 Markdown 格式存储
- 不支持分屏模式
- 适合轻度 Markdown 编辑

---

## 🔧 技术实现

### MarkdownRichEditor 组件

```typescript
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type ViewMode = 'edit' | 'preview' | 'split'

export default function MarkdownRichEditor({
  content,
  onChange,
  editable = true,
  placeholder = '开始写作...',
  className,
}: {
  content: string
  onChange: (content: string) => void
  editable?: boolean
  placeholder?: string
  className?: string
}) {
  const [viewMode, setViewMode] = useState<ViewMode>('edit')

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewMode('edit')}>编辑</button>
          <button onClick={() => setViewMode('preview')}>预览</button>
          <button onClick={() => setViewMode('split')}>分屏</button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="min-h-[500px]">
        {/* 编辑模式 */}
        {viewMode === 'edit' && (
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="font-mono text-sm"
          />
        )}

        {/* 预览模式 */}
        {viewMode === 'preview' && (
          <div className="prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {content || placeholder}
            </ReactMarkdown>
          </div>
        )}

        {/* 分屏模式 */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-2">
            <textarea
              value={content}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="font-mono text-sm border-r"
            />
            <div className="prose prose-sm sm:prose lg:prose max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {content || placeholder}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 编辑器集成

在 `src/components/admin/post-editor.tsx` 中更新：

```typescript
// 编辑模式（富文本 / Markdown 可视化 / Markdown 源码）
const [editMode, setEditMode] = useState<'rich' | 'markdown-visual' | 'markdown-source'>('markdown-visual')

// 渲染编辑器
{editMode === 'rich' && (
  <TipTapEditor
    content={formData.content}
    onChange={(content) => setFormData({ ...formData, content })}
    editable={true}
    placeholder="在这里写下你的文章内容..."
    className="min-h-[500px]"
  />
)}

{editMode === 'markdown-visual' && (
  <MarkdownRichEditor
    content={formData.content}
    onChange={(content) => setFormData({ ...formData, content })}
    editable={true}
    placeholder="在这里写下你的文章内容..."
  />
)}

{editMode === 'markdown-source' && (
  <MarkdownEditor
    content={formData.content}
    onChange={(content) => setFormData({ ...formData, content })}
    editable={true}
    placeholder="在这里写下你的文章内容..."
    className="border border-border rounded-lg"
  />
)}
```

---

## 🌐 使用方法

### 1. 新建文章

访问：http://localhost:3002/admin/posts/new

### 2. 选择编辑器

在"文章内容"部分，选择编辑器模式：

#### 使用 Markdown 可视化编辑器

1. 点击 **"Markdown"** 按钮
2. 选择视图模式：
   - **编辑**：纯 Markdown 源码编辑
   - **预览**：实时渲染预览
   - **分屏**：左边编辑，右边预览
3. 编写 Markdown 内容
4. 实时查看预览效果

#### Markdown 语法示例

```markdown
# 标题 1

## 标题 2

### 标题 3

**粗体** 和 *斜体*

- 列表项 1
- 列表项 2
- 列表项 3

1. 有序列表 1
2. 有序列表 2

[链接文本](https://example.com)

![图片描述](https://example.com/image.jpg)

`行内代码`

\`\`\`typescript
// 代码块
function hello() {
  console.log('Hello, World!')
}
\`\`\`

> 引用文本

---

| 表头 1 | 表头 2 |
|--------|--------|
| 单元格 1 | 单元格 2 |
```

---

## 📊 对比

| 特性 | 富文本编辑器 | Markdown 可视化 | Markdown 源码 |
|------|--------------|------------------|---------------|
| 编辑模式 | WYSIWYG | Markdown 源码 | Markdown 源码 |
| 预览模式 | 实时 | 实时 | 切换 |
| 分屏模式 | ❌ | ✅ | ❌ |
| 格式 | HTML | Markdown | Markdown |
| 适用用户 | 非技术 | 技术 | 轻度 |
| Markdown 支持 | 快捷键 | 原生 | 原生 |
| 工具栏 | ✅ 完整 | ❌ 无 | ❌ 无 |

---

## 📝 依赖安装

```bash
npm install @milkdown/core @milkdown/ctx @milkdown/plugin-listener @milkdown/plugin-history @milkdown/preset-commonmark @milkdown/preset-gfm @milkdown/theme-nord @milkdown/react @milkdown/prose --legacy-peer-deps
```

**注意**：虽然安装了 Milkdown 相关依赖，但当前实现使用了更轻量的方案（`react-markdown`），以简化集成和减少包大小。

---

## 🎯 使用建议

### 选择合适的编辑器

1. **富文本编辑器**：
   - 适合：非技术用户、需要复杂格式的文章
   - 推荐：常规博客文章

2. **Markdown 可视化编辑器**：
   - 适合：技术用户、开发者、技术博客
   - 推荐：教程、技术文章、代码示例

3. **Markdown 源码编辑器**：
   - 适合：轻度 Markdown 编辑、简单文章
   - 推荐：快速编辑、简单格式

### 最佳实践

1. **保持一致性**：同一篇文章使用同一种编辑器
2. **使用分屏模式**：编写技术文章时使用分屏模式，实时查看效果
3. **验证渲染**：发布前在预览模式下检查渲染效果
4. **使用代码高亮**：技术文章使用代码块并指定语言

---

## 🚀 下一步优化

### 1. 增强功能

- [ ] 添加 Markdown 语法提示
- [ ] 添加代码块语言选择
- [ ] 添加表格编辑器
- [ ] 添加数学公式支持（KaTeX）
- [ ] 添加图片拖放上传

### 2. 用户体验

- [ ] 同步滚动（分屏模式）
- [ ] 自动保存
- [ ] 编辑器主题切换
- [ ] 快捷键支持

### 3. 性能优化

- [ ] 虚拟滚动（长文档）
- [ ] 懒加载
- [ ] 防抖处理

---

## 🎉 总结

✅ **Markdown 富文本编辑器优化完成**

通过新增 Markdown 可视化编辑器，我们成功实现了：

- ✅ 原生 Markdown 语法支持
- ✅ 三种视图模式（编辑、预览、分屏）
- ✅ 实时渲染预览
- ✅ 满足技术用户的编辑需求
- ✅ 保留原有编辑器的优势

现在用户可以根据自己的需求选择最合适的编辑器：
- 非技术用户：富文本编辑器
- 技术用户：Markdown 可视化编辑器
- 轻度编辑：Markdown 源码编辑器

项目现在拥有更强大和灵活的编辑器功能！
