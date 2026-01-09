import { LayoutDashboard, FileText, Tag, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getSettings, getDictionary } from '@/lib/i18n'
import { auth } from '@/auth'

// 示例统计数据 (这些数据通常应该从 API 获取，为了演示我保留硬编码数值，但标题用翻译)
const getStats = (dict: any) => [
  {
    title: dict.admin.stats.totalPosts,
    value: '24',
    icon: FileText,
    change: '+12%',
    positive: true,
  },
  {
    title: dict.admin.stats.totalTags,
    value: '10',
    icon: Tag,
    change: '+2',
    positive: true,
  },
  {
    title: dict.admin.stats.totalCategories,
    value: '5',
    icon: LayoutDashboard,
    change: '0',
    positive: false,
  },
  {
    title: dict.admin.stats.totalUsers,
    value: '156',
    icon: Users,
    change: '+23%',
    positive: true,
  },
]

// 最近文章
const recentPosts = [
  {
    id: 1,
    title: 'Next.js 15 App Router Guide',
    status: 'published',
    date: '2024-01-15',
  },
  {
    id: 2,
    title: 'TypeScript Advanced Types',
    status: 'published',
    date: '2024-01-10',
  },
  {
    id: 3,
    title: 'Modern Websites with Tailwind CSS',
    status: 'draft',
    date: '2024-01-08',
  },
  {
    id: 4,
    title: 'Deep Dive into React Server Components',
    status: 'published',
    date: '2024-01-05',
  },
]

export default async function AdminDashboard() {
  const settings = await getSettings()
  const dict = await getDictionary(settings.language)
  const session = await auth()
  const user = session?.user

  const stats = getStats(dict)

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold">{dict.admin.dashboard}</h1>
        <p className="text-sm text-muted-foreground">
          {dict.admin.welcomeBack.replace('{name}', user?.name || 'Admin')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span
                className={`text-sm font-medium ${
                  stat.positive ? 'text-green-600' : 'text-muted-foreground'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="border border-border rounded-lg">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-lg font-semibold">{dict.admin.recentPosts}</h2>
            <Link
              href="/admin/posts"
              className="text-sm text-primary hover:underline"
            >
              {dict.common.viewAll} →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-accent transition">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="font-medium hover:text-primary transition"
                >
                  {post.title}
                </Link>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      post.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {post.status === 'published' ? dict.common.status.published : dict.common.status.draft}
                  </span>
                  <span>{post.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{dict.admin.quickActions.title}</h2>
            <div className="space-y-3">
              <Link
                href="/admin/posts/new"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition"
              >
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">{dict.admin.quickActions.newPost}</div>
                  <div className="text-sm text-muted-foreground">
                    {dict.admin.quickActions.newPostDesc}
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/tags"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition"
              >
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">{dict.admin.quickActions.manageTags}</div>
                  <div className="text-sm text-muted-foreground">
                    {dict.admin.quickActions.manageTagsDesc}
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/categories"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition"
              >
                <LayoutDashboard className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">{dict.admin.quickActions.manageCategories}</div>
                  <div className="text-sm text-muted-foreground">
                    {dict.admin.quickActions.manageCategoriesDesc}
                  </div>
                </div>
              </Link>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition"
              >
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-medium">{dict.admin.quickActions.siteSettings}</div>
                  <div className="text-sm text-muted-foreground">
                    {dict.admin.quickActions.siteSettingsDesc}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}