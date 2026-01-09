'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, ChevronLeft, Globe, FolderOpen } from 'lucide-react'
import { RichTextEditor } from './rich-text-editor'
import type { Dictionary } from '@/lib/i18n'

interface PageEditorProps {
  page?: any
  dict: Dictionary
}

export default function PageEditor({ page, dict }: PageEditorProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    status: page?.status || 'published',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })

    // Auto-generate slug
    if (e.target.name === 'title' && !page) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const url = page ? `/api/pages/${page.id}` : '/api/pages'
      const method = page ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save')
      }

      alert(dict.common.success)
      router.push('/admin/pages')
      router.refresh()
    } catch (error: any) {
      console.error('Save failed:', error)
      alert(error.message || dict.common.error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6 py-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-2 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold leading-none">
              {page ? dict.admin.pages?.edit || 'Edit Page' : dict.admin.pages?.new || 'New Page'}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? dict.common.saving : dict.common.save}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
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
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-1 group">
              <Globe className="w-3.5 h-3.5 opacity-50" />
              <span className="opacity-50 font-mono">/</span>
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

          <div className="min-h-[500px]">
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder={dict.admin.editor.contentPlaceholder}
              className="min-h-[60vh] shadow-sm text-sm"
            />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-6">
          <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
            <div className="px-3 py-2 border-b border-border bg-muted/20 font-medium text-xs flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5" />
              {dict.admin.editor.settings}
            </div>
            
            <div className="p-3 space-y-4">
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
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
