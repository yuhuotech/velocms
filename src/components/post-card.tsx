import Link from 'next/link'
import { Calendar, Clock, Tag } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  publishedAt: Date
  readingTime?: number
  tags?: Array<{ name: string; slug: string }>
}

export default function PostCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  readingTime,
  tags,
}: PostCardProps) {
  return (
    <article className="group border border-border rounded-lg overflow-hidden hover:border-primary transition-all duration-300">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Cover Image - Right side on desktop */}
        {coverImage && (
          <Link href={`/posts/${slug}`} className="sm:w-48 sm:h-auto relative overflow-hidden sm:order-2">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-32 sm:h-full sm:absolute sm:inset-0 sm:w-auto sm:min-w-[192px] object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        )}

        {/* Content - Left side */}
        <div className="flex-1 p-4 space-y-3">
          {/* Title */}
          <Link href={`/posts/${slug}`}>
            <h2 className="text-lg font-semibold group-hover:text-primary transition line-clamp-2">
              {title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {excerpt || '暂无摘要'}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(publishedAt)}</span>
            </div>
            {readingTime && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{readingTime} 分钟阅读</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded transition"
                >
                  <Tag className="w-3 h-3" />
                  {tag.name}
                </Link>
              ))}
              {tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
