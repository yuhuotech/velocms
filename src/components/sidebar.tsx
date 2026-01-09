import Link from 'next/link'
import { TrendingUp, Calendar, Tag } from 'lucide-react'
import type { Dictionary } from '@/lib/i18n'

interface SidebarProps {
  recentPosts?: Array<{ title: string; slug: string; publishedAt: Date }>
  popularTags?: Array<{ name: string; slug: string; count?: number }>
  dict: Dictionary
}

export default function Sidebar({ recentPosts, popularTags, dict }: SidebarProps) {
  return (
    <aside className="space-y-6">
      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
            <Calendar className="w-4 h-4" />
            {dict.sidebar.recentPosts}
          </h3>
          <ul className="space-y-3">
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition line-clamp-2"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Popular Tags */}
      {popularTags && popularTags.length > 0 && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" />
            {dict.sidebar.popularTags}
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded transition"
              >
                <Tag className="w-3 h-3" />
                {tag.name}
                {tag.count && <span className="text-xs opacity-60">({tag.count})</span>}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* About Widget */}
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">{dict.sidebar.about.title}</h3>
        <p className="text-sm text-muted-foreground">
          {dict.sidebar.about.description}
        </p>
      </div>
    </aside>
  )
}