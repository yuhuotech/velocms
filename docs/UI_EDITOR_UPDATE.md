# VeloCMS - UI 优化和编辑器增强

## ✅ 完成的更新

### 1. 文章列表页布局优化

**问题**：
- 头图太大，显得杂乱
- 布局不够紧凑

**解决方案**：
- 改为左右布局，文字在左侧，图片在右侧
- 缩小图片尺寸（桌面端：192px 宽，固定高度）
- 保持响应式设计（移动端仍然垂直布局）
- 限制标签显示数量（最多显示 3 个）

**效果**：
- 更紧凑的布局
- 更好的阅读体验
- 减少视觉干扰

**文件修改**：
- `src/components/post-card.tsx`

---

### 2. 文章编辑器增强

**需求**：
- 支持富文本编辑器
- 支持 Markdown 编辑器
- 内容支持 Markdown 显示

**解决方案**：

#### 2.1 集成 Tiptap 富文本编辑器

**特性**：
- 所见即所得（WYSIWYG）编辑
- 支持 Markdown 语法（通过快捷键）
- 基本的格式化工具：
  - 撤销/重做
  - 标题（H1, H2, H3）
  - 文本格式（粗体、斜体、删除线、代码）
  - 列表（无序、有序）
  - 插入图片
  - 插入链接
- 占位符提示
- 响应式设计

**文件**：
- `src/components/admin/tiptap-editor.tsx`

#### 2.2 集成 Markdown 编辑器

**特性**：
- 编辑/预览模式切换
- 实时预览（使用 `react-markdown`）
- 支持 GFM（GitHub Flavored Markdown）
- 代码高亮（使用 `highlight.js`）
- 语法提示
- 占位符提示

**文件**：
- `src/components/admin/markdown-editor.tsx`

#### 2.3 编辑模式切换

在文章编辑页面中添加了编辑模式切换功能：
- **富文本模式**：使用 Tiptap 编辑器
- **Markdown 模式**：使用 Markdown 编辑器（支持预览）

用户可以根据自己的喜好选择编辑方式。

**文件修改**：
- `src/components/admin/post-editor.tsx`

---

## 📦 安装的依赖

### Tiptap 编辑器

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-image @tiptap/extension-link @tiptap/extension-bold @tiptap/extension-italic @tiptap/extension-strike @tiptap/extension-code @tiptap/extension-code-block-lowlight lowlight @tailwindcss/typography
```

### Markdown 渲染

```bash
npm install react-markdown remark-gfm rehype-highlight
```

---

## 🎨 新增组件

### TipTapEditor

**位置**：`src/components/admin/tiptap-editor.tsx`

**Props**：
```typescript
{
  content: string          // 编辑器内容（HTML 格式）
  onChange: (content: string) => void  // 内容变化回调
  editable?: boolean       // 是否可编辑
  placeholder?: string     // 占位符文本
  className?: string       // 自定义类名
}
```

**使用示例**：
```tsx
<TipTapEditor
  content={formData.content}
  onChange={(content) => setFormData({ ...formData, content })}
  editable={true}
  placeholder="在这里写下你的文章内容..."
/>
```

### MarkdownEditor

**位置**：`src/components/admin/markdown-editor.tsx`

**Props**：
```typescript
{
  content: string          // 编辑器内容（Markdown 格式）
  onChange: (content: string) => void  // 内容变化回调
  editable?: boolean       // 是否可编辑
  placeholder?: string     // 占位符文本
  className?: string       // 自定义类名
}
```

**使用示例**：
```tsx
<MarkdownEditor
  content={formData.content}
  onChange={(content) => setFormData({ ...formData, content })}
  editable={true}
  placeholder="在这里写下你的文章内容..."
/>
```

---

## 🎯 使用方法

### 1. 查看优化后的文章列表

访问：http://localhost:3002/posts

**新布局特点**：
- 文字在左侧
- 图片在右侧（桌面端）
- 更紧凑的布局
- 更好的阅读体验

### 2. 使用富文本编辑器

访问：http://localhost:3002/admin/posts/new

1. 点击"富文本"按钮
2. 使用工具栏进行格式化：
   - 点击按钮应用格式
   - 使用快捷键：
     - `Cmd/Ctrl + B`：粗体
     - `Cmd/Ctrl + I`：斜体
     - `Cmd/Ctrl + ` `：代码
     - `Cmd/Ctrl + Z`：撤销
     - `Cmd/Ctrl + Shift + Z`：重做

### 3. 使用 Markdown 编辑器

访问：http://localhost:3002/admin/posts/new

1. 点击"Markdown"按钮
2. 在编辑区输入 Markdown 内容
3. 点击"预览"按钮查看渲染效果
4. 支持：
   - 标题（# ## ###）
   - 粗体（**文本**）
   - 斜体（*文本*）
   - 代码（`代码`）
   - 代码块（```代码```）
   - 列表（- 或 1.）
   - 链接（[文本](URL)）
   - 图片（![alt](URL)）

### 4. 编辑现有文章

访问：http://localhost:3002/admin/posts/1/edit

可以：
- 切换编辑模式（富文本 / Markdown）
- 保存草稿
- 发布文章

---

## 📊 构建输出

```
Route (app)                                   Size  First Load JS
├ ƒ /admin/posts/[id]/edit                   135 B         325 kB
├ ○ /admin/posts/new                         135 B         325 kB
├ ○ /search                                3.99 kB         117 kB
└ [...其他页面]
```

注意：由于集成了 Tiptap 和相关依赖，编辑页面的包大小有所增加。

---

## 🎨 界面预览

### 文章卡片（优化后）

```
┌─────────────────────────────────────────────┐
│ [文章标题]                        [封面图] │
│ [文章摘要]                        (右侧)  │
│ 📅 日期  ⏱️ 阅读时间              (192px)│
│ [标签1] [标签2] [标签3]           (固定)  │
└─────────────────────────────────────────────┘
```

### 富文本编辑器

```
┌─────────────────────────────────────────────┐
│ [↩] [↪] [H1] [H2] [B] [I] [S] [C] [•] [1.] [🖼] [🔗] │
├─────────────────────────────────────────────┤
│                                             │
│ 在这里写下你的文章内容...                    │
│                                             │
│ 支持 Markdown 语法（通过快捷键）            │
│                                             │
└─────────────────────────────────────────────┘
```

### Markdown 编辑器

```
┌─────────────────────────────────────────────┐
│ [编辑] [预览]                    支持 Markdown │
├─────────────────────────────────────────────┤
│ # 标题                                    │
│ **粗体** *斜体* `代码`                     │
│ - 列表1                                   │
│ - 列表2                                   │
│ ```code```                                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 💡 技术细节

### Tiptap 编辑器

**核心扩展**：
- `@tiptap/starter-kit`：基本功能
- `@tiptap/extension-placeholder`：占位符
- `@tiptap/extension-image`：图片支持
- `@tiptap/extension-link`：链接支持

**样式**：
- 使用 Tailwind CSS 进行样式设计
- 工具栏按钮状态反馈
- 编辑器使用 `@tailwindcss/typography` 进行内容样式化

### Markdown 编辑器

**核心库**：
- `react-markdown`：Markdown 渲染
- `remark-gfm`：GitHub Flavored Markdown
- `rehype-highlight`：代码高亮
- `highlight.js`：代码高亮引擎

**特性**：
- 实时预览
- 代码语法高亮
- GFM 支持（表格、删除线等）

---

## 📝 注意事项

### 1. 编辑器模式切换

- 富文本模式和 Markdown 模式使用不同的数据格式
- 富文本模式生成 HTML
- Markdown 模式生成 Markdown
- 切换模式时，内容可能需要转换（目前未实现自动转换）

### 2. 内容存储

- 建议统一使用 Markdown 格式存储
- 富文本编辑器生成的 HTML 可以转换为 Markdown（需要额外工具）
- 目前两种模式的内容是独立的

### 3. 性能考虑

- Tiptap 编辑器增加了约 217KB 的包大小
- 如果只需要 Markdown，可以只使用 Markdown 编辑器
- 可以考虑代码分割和懒加载优化

---

## 🚀 下一步优化

### 1. 编辑器功能增强

- [ ] 添加表格支持
- [ ] 添加代码块语言选择
- [ ] 添加更多格式化选项（对齐、缩进等）
- [ ] 添加媒体库集成
- [ ] 添加图片上传功能

### 2. 编辑器模式转换

- [ ] 实现 HTML ↔ Markdown 双向转换
- [ ] 保持编辑模式切换时内容一致

### 3. 性能优化

- [ ] 实现编辑器懒加载
- [ ] 减少包大小
- [ ] 优化渲染性能

### 4. 用户体验

- [ ] 添加自动保存功能
- [ ] 添加版本历史
- [ ] 添加协作编辑功能

---

## 🎉 总结

✅ **文章列表页布局优化**
- 改为左右布局，更紧凑
- 图片在右侧，文字在左侧
- 提升阅读体验

✅ **富文本编辑器集成**
- 基于 Tiptap
- 所见即所得
- 支持 Markdown 快捷键
- 完整的工具栏

✅ **Markdown 编辑器集成**
- 编辑/预览模式
- 实时渲染
- 代码高亮
- GFM 支持

✅ **编辑模式切换**
- 自由切换富文本和 Markdown
- 满足不同用户需求

项目现在拥有更优秀的 UI 和强大的编辑功能！
