'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, X, Plus, ChevronLeft, Calendar, Globe, Hash, FolderOpen, ImageIcon, LayoutTemplate, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RichTextEditor } from './rich-text-editor'
import type { Dictionary } from '@/lib/i18n'

interface PostEditorProps {
  post?: any
  dict: Dictionary
}

export default function PostEditor({ post, dict }: PostEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    coverImage: post?.coverImage || '',
    status: post?.status || 'draft',
    tags: post?.tags || [],
    category: post?.category || '',
  })

  // Tag input
  const [tagInput, setTagInput] = useState('')

  // Handle changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    // Auto-generate slug (only for new posts and if title changes)
    if (e.target.name === 'title' && !post) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  // Remove tag
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t: string) => t !== tag),
    })
  }

  // Image upload
  const handleImageUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) {
        // Mock upload logic
        console.log('Upload cover:', file)
      }
    }
    input.click()
  }

  // Save/Publish
  const handleAction = async (status: 'draft' | 'published') => {
    setIsSaving(true)
    try {
      console.log(`Saving as ${status}:`, { ...formData, status })
      await new Promise((resolve) => setTimeout(resolve, 800))
      alert(status === 'published' ? dict.admin.editor.published : dict.admin.editor.saved)
      if (status === 'published') router.push('/admin/posts')
    } catch (error) {
      console.error('Operation failed:', error)
      alert(dict.common.error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
            title={dict.admin.editor.back}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold leading-none">
              {post ? dict.admin.editor.edit : dict.admin.editor.new}
            </h1>
            <span className="text-[10px] text-muted-foreground">
              {isSaving ? dict.admin.editor.saving : dict.admin.editor.ready}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction('draft')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-accent transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {dict.admin.editor.saveDraft}
          </button>
          <button
            onClick={() => handleAction('published')}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Eye className="w-3.5 h-3.5" />
            {dict.admin.editor.publish}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Main Editor (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Title & Slug */}
          <div className="space-y-3">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={dict.admin.editor.titlePlaceholder}
              className="w-full text-2xl font-bold tracking-tight bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-sm"
              autoFocus
            />
            
            {/* Slug */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 group">
              <Globe className="w-3.5 h-3.5 opacity-50" />
              <span className="opacity-50 font-mono">your-site.com/posts/</span>
              <input 
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-slug"
                className="bg-transparent border-b border-dashed border-border hover:border-primary/50 focus:border-primary focus:outline-none py-0.5 text-foreground/80 transition-colors min-w-[200px] font-mono"
              />
            </div>
          </div>

          {/* Editor */}
          <div className="min-h-[500px]">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder={dict.admin.editor.contentPlaceholder}
              className="min-h-[60vh] shadow-sm text-sm"
            />
          </div>

          {/* Excerpt */}
          <div className="pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <LayoutTemplate className="w-4 h-4" />
              <h3 className="font-medium text-sm">{dict.admin.editor.excerpt}</h3>
            </div>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder={dict.admin.editor.excerptPlaceholder}
              rows={3}
              className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all text-xs resize-none"
            />
          </div>
        </div>

        {/* Sidebar Settings (1 col) */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
          
          {/* Settings Card */}
          <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-border bg-muted/20 font-medium text-xs flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5" />
              {dict.admin.editor.settings}
            </div>
            
            <div className="p-3 space-y-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">{dict.admin.editor.category}</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">{dict.admin.editor.uncategorized}</option>
                  <option value="技术">技术</option>
                  <option value="生活">生活</option>
                  <option value="教程">教程</option>
                </select>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">{dict.admin.editor.tags}</label>
                <div className="flex flex-wrap gap-1.5 mb-1.5">
                  {formData.tags.map((tag: string) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px]">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <Hash className="absolute left-2 top-2 w-3 h-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder={dict.admin.editor.tagsPlaceholder}
                    className="w-full pl-6 pr-2 py-1.5 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-muted-foreground uppercase">{dict.admin.editor.status}</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-background border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="draft">{dict.common.status.draft}</option>
                  <option value="published">{dict.common.status.published}</option>
                  <option value="scheduled">{dict.common.status.scheduled}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm group">
            <div className="px-3 py-2 border-b border-border bg-muted/20 font-medium text-xs flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" />
              {dict.admin.editor.coverImage}
            </div>
            
            <div className="p-3">
              {formData.coverImage ? (
                <div className="relative aspect-video rounded-md overflow-hidden border border-border">
                  <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setFormData({ ...formData, coverImage: '' })}
                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded hover:bg-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={handleImageUpload}
                  className="aspect-video border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
                >
                  <Upload className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-[10px]">{dict.admin.editor.clickToUpload}</span>
                </div>
              )}
              
              <div className="mt-2">
                <input
                  type="text"
                  name="coverImage"
                  value={formData.coverImage}
                  onChange={handleChange}
                  placeholder={dict.admin.editor.imageUrlPlaceholder}
                  className="w-full px-2 py-1.5 text-[10px] bg-muted/30 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
