'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface PostsClientProps {
  dict: Dictionary
  initialPosts: any[]
}

export default function PostsClient({ dict, initialPosts }: PostsClientProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])

  // 过滤文章
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.slug.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(filteredPosts.map((post) => post.id))
    }
  }

  // 删除文章
  const handleDelete = (id: number) => {
    if (confirm(dict.admin.postList.deleteConfirm)) {
      console.log('删除文章:', id)
      // 实际应该调用 API
    }
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (confirm(dict.admin.postList.batchDeleteConfirm.replace('{count}', selectedPosts.length.toString()))) {
      console.log('批量删除:', selectedPosts)
      setSelectedPosts([])
      // 实际应该调用 API
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{dict.admin.postList.title}</h1>
          <p className="text-xs text-muted-foreground">{dict.common.pagination.showing
            .replace('{start}', '1')
            .replace('{end}', filteredPosts.length.toString())
            .replace('{total}', posts.length.toString())}</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition text-sm"
        >
          <Plus className="w-4 h-4" />
          {dict.admin.postList.newPost}
        </Link>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center gap-3 border border-border rounded-lg p-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.common.search}
            className="w-full pl-9 pr-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        >
          <option value="all">{dict.common.status.all}</option>
          <option value="published">{dict.common.status.published}</option>
          <option value="draft">{dict.common.status.draft}</option>
        </select>

        {/* Batch Delete */}
        {selectedPosts.length > 0 && (
          <button
            onClick={handleBatchDelete}
            className="flex items-center gap-2 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {dict.common.delete} ({selectedPosts.length})
          </button>
        )}
      </div>

      {/* Posts Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  checked={selectedPosts.length > 0 && selectedPosts.length === filteredPosts.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.title}</th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.status}</th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.author}</th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.date}</th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.views}</th>
              <th className="px-4 py-2 text-left font-medium">{dict.admin.postList.table.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredPosts.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {dict.admin.postList.empty}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-accent/50">
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPosts([...selectedPosts, post.id])
                        } else {
                          setSelectedPosts(
                            selectedPosts.filter((id) => id !== post.id)
                          )
                        }
                      }}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div>
                      <div className="font-medium">{post.title}</div>
                      <div className="text-xs text-muted-foreground">
                        /{post.slug}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        post.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}
                    >
                      {post.status === 'published' ? dict.common.status.published : dict.common.status.draft}
                    </span>
                  </td>
                  <td className="px-4 py-2">{post.author || 'Admin'}</td>
                  <td className="px-4 py-2">{new Date(post.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{post.viewCount || 0}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/posts/${post.slug}`}
                        target="_blank"
                        className="p-1.5 hover:bg-accent rounded transition"
                        title={dict.common.preview}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="p-1.5 hover:bg-accent rounded transition"
                        title={dict.common.edit}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 hover:bg-accent rounded transition"
                        title={dict.common.delete}
                      >
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

      {/* Pagination */}
      <div className="flex items-center justify-between border border-border rounded-lg p-3">
        <div className="text-xs text-muted-foreground">
          {dict.common.pagination.showing
            .replace('{start}', '1')
            .replace('{end}', filteredPosts.length.toString())
            .replace('{total}', posts.length.toString())}
        </div>
        <div className="flex gap-2">
          <button
            disabled
            className="px-2 py-1 border border-border rounded-md text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dict.home.pagination.prev}
          </button>
          <button className="px-2 py-1 bg-primary text-primary-foreground rounded-md text-xs">
            1
          </button>
          <button className="px-2 py-1 border border-border rounded-md text-xs hover:bg-accent transition">
            2
          </button>
          <button className="px-2 py-1 border border-border rounded-md text-xs hover:bg-accent transition">
            {dict.home.pagination.next}
          </button>
        </div>
      </div>
    </div>
  )
}
