# 文件下载 404 错误修复

## 🐛 问题

用户遇到错误：
```
GET http://localhost:3002/api/files/1/download 404 (Not Found)
```

## 🔍 问题原因

### 1. 缺少下载路由
- 文件上传 API 存在：`/api/files/upload`
- 但是下载路由不存在：`/api/files/[id]/download`

### 2. 图片 Content-Disposition 错误
- 图片文件使用了 `attachment`（下载）而不是 `inline`（显示）
- 导致浏览器尝试下载图片而不是显示

---

## ✅ 修复方案

### 修复1：创建下载路由

**文件：** `/src/app/api/files/[id]/download/route.ts`

**功能：**
- 根据文件 ID 查找文件
- 本地存储：读取文件并返回
- Vercel Blob：重定向到存储 URL

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const file = await fileRepository.findById(parseInt(id))

  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  // Vercel Blob - 重定向
  if (file.storageType === 'vercel_blob' && file.url) {
    return NextResponse.redirect(file.url)
  }

  // 本地存储 - 读取文件
  const filepath = file.storagePath
  const fileBuffer = await fs.readFile(filepath)

  const headers = new Headers()
  headers.set('Content-Type', file.mimeType)
  headers.set('Content-Length', fileBuffer.length.toString())

  // 🔧 修复：图片使用 inline 显示
  const isImage = file.mimeType.startsWith('image/')
  const disposition = isImage ? 'inline' : 'attachment'
  headers.set('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`)

  return new NextResponse(fileBuffer, { headers })
}
```

---

### 修复2：修改编辑器插入的 URL

**文件：** `/src/components/admin/markdown-editor.tsx`

**修改内容：**
- 图片 URL：`/api/files/${data.id}/download`
- 文档 URL：`/api/files/${data.id}/download`

```typescript
if (isImage) {
  // 图片：插入图片 Markdown
  insertElement(`<img src="/api/files/${data.id}/download" alt="${data.originalName}" />`)
} else {
  // 文档：插入文件下载链接
  insertElement(
    `<a href="/api/files/${data.id}/download" download="${encodeURIComponent(data.originalName)}">
      ${data.originalName} (${fileSize} KB)
    </a>`
  )
}
```

---

## 🎯 路由结构

```
/api/files/
  ├── upload/ (POST)
  │   └── route.ts
  └── [id]/
      ├── route.ts (GET/DELETE)
      └── download/
          └── route.ts (GET) ← 新增
```

---

## 📊 修复对比

| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| **下载路由** | ❌ 不存在 | ✅ `/api/files/[id]/download` |
| **图片显示** | ❌ 下载图片 | ✅ 显示图片 |
| **文档下载** | ❌ 404 | ✅ 下载文档 |
| **Content-Disposition** | ❌ 都是 attachment | ✅ 图片 inline，文档 attachment |

---

## 🧪 测试

### 测试1：上传图片
1. 访问：http://localhost:3002/admin/posts/new
2. 点击 "Upload" 按钮
3. 选择图片文件（`.png`, `.jpg`）
4. ✅ 自动上传并插入到编辑器
5. ✅ 预览时图片正常显示

### 测试2：上传文档
1. 点击 "Upload" 按钮
2. 选择文档文件（`.pdf`, `.docx`）
3. ✅ 自动上传并插入下载链接
4. ✅ 预览时显示下载卡片

### 测试3：访问下载链接
- 图片：`http://localhost:3002/api/files/1/download` ✅ 显示图片
- 文档：`http://localhost:3002/api/files/2/download` ✅ 下载文档

---

## ✅ 修复清单

- [x] 创建 `/api/files/[id]/download` 路由
- [x] 图片使用 `inline` Content-Disposition
- [x] 文档使用 `attachment` Content-Disposition
- [x] 修改编辑器插入的 URL
- [x] 重启开发服务器

---

## 🚀 现在可以正常使用了

**开发服务器：** http://localhost:3002
**后台编辑器：** http://localhost:3002/admin/posts/new

**测试步骤：**
1. 上传图片 → 预览正常显示 ✅
2. 上传文档 → 显示下载卡片 ✅
3. 点击下载链接 → 正常下载 ✅

---

## 🎉 总结

**问题：** 文件下载 API 缺失，导致 404 错误

**解决方案：**
1. ✅ 创建 `/api/files/[id]/download` 路由
2. ✅ 图片使用 `inline` 显示
3. ✅ 文档使用 `attachment` 下载

**结果：** 所有文件功能正常工作！
