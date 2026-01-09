'use client'

import { useState } from 'react'
import { FolderKanban, Plus, Search, Edit, Trash2 } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface CategoriesClientProps {
  dict: Dictionary
}

// 示例分类数据
const categories = [
  {
    id: 1,
    name: '技术',
    slug: 'tech',
    description: '技术相关文章',
    count: 20,
    createdAt: '2024-01-01',
  },
  {
    id: 2,
    name: '生活',
    slug: 'life',
    description: '生活随笔',
    count: 8,
    createdAt: '2024-01-02',
  },
  {
    id: 3,
    name: '教程',
    slug: 'tutorial',
    description: '教程和指南',
    count: 15,
    createdAt: '2024-01-03',
  },
  {
    id: 4,
    name: '笔记',
    slug: 'notes',
    description: '学习笔记',
    count: 12,
    createdAt: '2024-01-04',
  },
  {
    id: 5,
    name: '资源',
    slug: 'resources',
    description: '有用资源',
    count: 5,
    createdAt: '2024-01-05',
  },
]

export default function CategoriesClient({ dict }: CategoriesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
  })

  // 过滤分类
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 打开新建对话框
  const handleNew = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '', description: '' })
    setIsDialogOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
    })
    setIsDialogOpen(true)
  }

  // 删除分类
  const handleDelete = (id: number) => {
    if (confirm(dict.admin.categories.deleteConfirm)) {
      console.log('删除分类:', id)
      // 实际应该调用 API
    }
  }

  // 保存分类
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('保存分类:', formData)
    // 实际应该调用 API
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{dict.admin.categories.title}</h1>
          <p className="text-xs text-muted-foreground">{dict.common.pagination.showing
            .replace('{start}', '1')
            .replace('{end}', filteredCategories.length.toString())
            .replace('{total}', categories.length.toString())}</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          {dict.admin.categories.new}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={dict.common.search}
          className="w-full pl-9 pr-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full text-center py-8 border border-border rounded-lg">
            <FolderKanban className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">{dict.admin.categories.empty}</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="border border-border rounded-lg p-4 hover:border-primary transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-0.5 text-sm">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">/{category.slug}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 hover:bg-accent rounded-md transition"
                    title={dict.common.edit}
                  >
                    <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1.5 hover:bg-accent rounded-md transition"
                    title={dict.common.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {category.description}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{category.count} {dict.admin.categories.fields.count.replace('文章数', '篇文章')}</span>
                <span className="text-muted-foreground">{category.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editingCategory ? dict.admin.categories.edit : dict.admin.categories.new}
              </h2>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="p-1.5 hover:bg-accent rounded-md transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label htmlFor="name" className="block text-xs font-medium mb-1.5">
                  {dict.admin.categories.fields.name} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    // 自动生成 slug
                    if (!editingCategory) {
                      const slug = e.target.value
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                      setFormData((prev) => ({ ...prev, slug }))
                    }
                  }}
                  placeholder={dict.admin.categories.placeholders.name}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-xs font-medium mb-1.5">
                  {dict.admin.categories.fields.slug} <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder={dict.admin.categories.placeholders.slug}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-medium mb-1.5">
                  {dict.admin.categories.fields.description}
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder={dict.admin.categories.placeholders.description}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 px-3 py-2 border border-border rounded-md hover:bg-accent transition text-sm"
                >
                  {dict.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition text-sm"
                >
                  {editingCategory ? dict.common.update : dict.common.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
