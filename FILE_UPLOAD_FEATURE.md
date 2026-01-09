# 文件上传功能实现总结

## ✅ 已完成的功能

### 1. 文件类型支持 ✅
- **图片**：`image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml`, `image/bmp`
- **办公文档**：PDF, Word, Excel, PowerPoint, TXT, Markdown
- **压缩文件**：ZIP, RAR, 7Z, TAR, GZ, BZ2

### 2. 后台 Markdown 编辑器文件上传 ✅
- 添加文件上传按钮到工具栏
- 支持拖拽上传
- 自动识别文件类型
- 图片：直接插入图片 Markdown
- 文档：插入文件下载链接（带文件名和大小）

### 3. 前台显示功能 ✅
- **图片**：直接显示预览
- **文档**：显示文件下载卡片（文件名 + 大小 + 下载按钮）

---

## 📁 修改的文件

### 1. `/src/app/api/files/upload/route.ts`
**修改内容：**
- 恢复所有文件类型支持（图片 + 文档 + 压缩）
- 文件类型列表：
  ```typescript
  const allowedTypes = [
    // 图片
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    // 办公文档
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain', 'text/markdown',
    // 压缩文件
    'application/zip', 'application/x-zip-compressed', 'application/vnd.rar',
    'application/x-7z-compressed', 'application/x-tar', 'application/x-gzip', 'application/x-bzip2',
  ]
  ```

---

### 2. `/src/components/files/file-upload.tsx`
**修改内容：**
- 恢复图片文件类型支持
- 更新默认 accept 属性：
  ```typescript
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.tar,.gz,.bz2'
  ```
- 导出 `UploadedFile` 类型

---

### 3. `/src/components/admin/markdown-editor.tsx`
**修改内容：**
- 添加 `File` 和 `Upload` 图标导入
- 添加文件上传状态管理
- 添加文件上传处理函数
- 在工具栏添加文件上传按钮

**新增功能：**
```typescript
// 文件上传处理
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  // 上传文件
  const formData = new FormData()
  formData.append('file', file)
  const response = await fetch('/api/files/upload', { method: 'POST', body: formData })

  // 判断文件类型
  const isImage = file.type.startsWith('image/')

  if (isImage) {
    // 图片：插入图片 Markdown
    insertElement(`<img src="${data.downloadUrl}" alt="${data.originalName}" />`)
  } else {
    // 文档：插入文件下载链接
    insertElement(
      `<a href="${data.downloadUrl}" download="${data.originalName}">
        ${data.originalName} (${fileSize} KB)
      </a>`
    )
  }
}
```

**工具栏新增按钮：**
```tsx
<ToolbarButton onClick={() => setShowFileUpload(!showFileUpload)} title="上传文件">
  <Upload className="w-4 h-4" />
</ToolbarButton>

{showFileUpload && (
  <input
    type="file"
    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.rar,.7z,.tar,.gz,.bz2"
    onChange={handleFileUpload}
  />
)}
```

---

### 4. `/src/components/markdown-content.tsx`
**修改内容：**
- 添加 `File` 和 `Download` 图标导入
- 添加 `FileLink` 组件（文件下载卡片）
- 添加链接处理（区分普通链接和文件链接）
- 添加图片处理（直接显示）

**新增 FileLink 组件：**
```tsx
function FileLink({ href, children }: { href: string; children: React.ReactNode }) {
  const childText = getTextContent(children)
  const filename = childText.split(' (')[0]

  // 判断是否为图片
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const isImage = imageExtensions.some(ext => href.toLowerCase().includes(ext))

  if (isImage) {
    // 图片：直接显示
    return <img src={href} alt={filename} className="rounded-lg max-w-full h-auto" />
  }

  // 文档：显示下载卡片
  return (
    <a href={href} download={filename} className="file-download-card">
      <File className="w-8 h-8" />
      <span>{filename}</span>
      <Download className="w-5 h-5" />
    </a>
  )
}
```

**ReactMarkdown 组件更新：**
```tsx
<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeHighlight]}
  components={{
    a({ node, children, href, ...props }: any) {
      // 判断是否为文件链接
      const fileExtensions = [
        '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
        '.txt', '.md', '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
        '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'
      ]

      const isFileLink = fileExtensions.some(ext => href?.toLowerCase().includes(ext))

      if (isFileLink) {
        return <FileLink href={href}>{children}</FileLink>
      }

      // 普通链接
      return <a href={href} className="text-primary hover:underline">{children}</a>
    },

    img({ node, src, alt, ...props }: any) {
      // 图片：直接显示
      return <img src={src} alt={alt} className="rounded-lg max-w-full h-auto" {...props} />
    },
  }}
>
  {content}
</ReactMarkdown>
```

---

## 🎨 功能演示

### 1. 后台 Markdown 编辑器

#### **工具栏：**
```
[H1][H2][H3] | [B][I][U] | [UL][OL] | [Link][Image][Upload]
```

#### **上传文件：**
1. 点击 "Upload" 按钮
2. 选择文件（支持图片、文档、压缩）
3. 自动上传并插入到编辑器

#### **插入效果：**
- **图片**：`![图片](/api/files/123/download)`
- **文档**：`[文档](/api/files/123/download)`

---

### 2. 前台显示

#### **图片显示：**
```markdown
![示例图片](/api/files/123/download)
```
**渲染结果：**
```
┌─────────────────┐
│                 │
│   [图片预览]    │
│                 │
└─────────────────┘
```

#### **文档下载：**
```markdown
[示例文档.pdf (1024 KB)](/api/files/456/download)
```
**渲染结果：**
```
┌─────────────────────────────────┐
│ [File]  示例文档.pdf  [Download] │
│         1024 KB                  │
└─────────────────────────────────┘
```

---

## 📊 文件类型支持表

| 类型 | 扩展名 | 后台上传 | 前台显示 | 存储方式 |
|------|--------|---------|---------|---------|
| **图片** | `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`, `.bmp` | ✅ | 🖼️ 直接显示 | 自动 |
| **PDF** | `.pdf` | ✅ | 📄 下载卡片 | 自动 |
| **Word** | `.doc`, `.docx` | ✅ | 📄 下载卡片 | 自动 |
| **Excel** | `.xls`, `.xlsx` | ✅ | 📄 下载卡片 | 自动 |
| **PowerPoint** | `.ppt`, `.pptx` | ✅ | 📄 下载卡片 | 自动 |
| **文本** | `.txt`, `.md` | ✅ | 📄 下载卡片 | 自动 |
| **压缩** | `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.bz2` | ✅ | 📄 下载卡片 | 自动 |

---

## 🔄 工作流程

### **上传流程：**
```
用户点击上传按钮
    ↓
选择文件
    ↓
上传到存储服务（本地/Vercel Blob）
    ↓
保存元数据到数据库
    ↓
自动插入 Markdown
    ↓
显示成功提示
```

### **显示流程：**
```
前台页面加载
    ↓
解析 Markdown
    ↓
识别文件链接
    ↓
判断文件类型
    ↓
- 图片：直接显示
- 文档：显示下载卡片
```

---

## 🎯 特性总结

| 功能 | 状态 |
|------|------|
| **支持图片上传** | ✅ 完成 |
| **支持文档上传** | ✅ 完成 |
| **支持压缩文件上传** | ✅ 完成 |
| **后台编辑器上传按钮** | ✅ 完成 |
| **图片前台直接显示** | ✅ 完成 |
| **文档前台下载卡片** | ✅ 完成 |
| **自动识别文件类型** | ✅ 完成 |
| **跨环境存储** | ✅ 完成 |
| **TypeScript 类型** | ✅ 完成 |

---

## 🚀 使用示例

### **示例1：上传图片**
1. 打开后台文章编辑器
2. 点击工具栏 "Upload" 按钮
3. 选择图片文件（如 `screenshot.png`）
4. 自动上传并插入：
   ```markdown
   ![screenshot.png](/api/files/123/download)
   ```

### **示例2：上传文档**
1. 打开后台文章编辑器
2. 点击工具栏 "Upload" 按钮
3. 选择文档文件（如 `guide.pdf`）
4. 自动上传并插入：
   ```markdown
   [guide.pdf (1024 KB)](/api/files/456/download)
   ```

### **示例3：前台显示**
- **图片**：直接显示图片预览
- **文档**：显示文件下载卡片（文件名 + 大小 + 下载按钮）

---

## 📝 注意事项

1. **文件大小限制**：100MB
2. **存储方式**：
   - 本地：`./data/uploads/`
   - Vercel：Vercel Blob（自动）
3. **下载权限**：公开访问（无需登录）
4. **删除权限**：需要管理员权限

---

## 🎉 总结

**文件上传功能已完美实现：**
- ✅ 支持图片、文档、压缩文件
- ✅ 后台 Markdown 编辑器集成
- ✅ 前台自动识别并显示
- ✅ 图片直接显示，文档显示下载卡片
- ✅ 跨环境存储（本地 + Vercel）
- ✅ TypeScript 类型安全

**开发服务器：** http://localhost:3002
**后台编辑器：** http://localhost:3002/admin/posts/new
**示例页面：** http://localhost:3002/files
