'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface PagesClientProps {
  dict: Dictionary
}

export default function PagesClient({ dict }: PagesClientProps) {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/pages')
      .then((res) => res.json())
      .then((data) => {
        setPages(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm(dict.common.confirmDelete)) return

    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{dict.admin.pages?.title || 'Pages'}</h1>
          <p className="text-xs text-muted-foreground">{filteredPages.length} pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          {dict.admin.pages?.new || 'New Page'}
        </Link>
      </div>

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

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Title</th>
              <th className="px-4 py-2 text-left font-medium">Slug</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Date</th>
              <th className="px-4 py-2 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center">{dict.common.loading}</td></tr>
            ) : filteredPages.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No pages found</td></tr>
            ) : (
              filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-accent/50">
                  <td className="px-4 py-2 font-medium">{page.title}</td>
                  <td className="px-4 py-2 text-muted-foreground">/{page.slug}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      page.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {new Date(page.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/${page.slug}`} target="_blank" className="p-1.5 hover:bg-accent rounded">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <Link href={`/admin/pages/${page.id}/edit`} className="p-1.5 hover:bg-accent rounded">
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <button onClick={() => handleDelete(page.id)} className="p-1.5 hover:bg-accent rounded">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
