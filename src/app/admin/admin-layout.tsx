'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Tag,
  FolderKanban,
  Settings,
  Menu,
  X,
  LogOut,
  Plus,
  Sun,
  Moon,
  User,
  Home,
  Palette,
  Monitor,
  ChevronDown,
  MessageSquare,
} from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { useTheme } from 'next-themes'
import type { Dictionary } from '@/lib/i18n'

type ThemeMode = 'light' | 'dark' | 'system'

const themeLabels: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
}

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  system: <Monitor className="w-5 h-5" />,
}

interface AdminLayoutProps {
  children: React.ReactNode
  dict: Dictionary
}

export default function AdminLayout({
  children,
  dict
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const user = session?.user

  const currentTheme: ThemeMode = (theme as ThemeMode) || 'system'

  const selectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme)
    setThemeMenuOpen(false)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
    router.refresh()
  }

  const menuItems = [
    {
      title: dict.admin.dashboard,
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      title: dict.admin.posts,
      icon: FileText,
      href: '/admin/posts',
    },
    {
      title: dict.admin.pages?.title || 'Pages',
      icon: FileText,
      href: '/admin/pages',
    },
    {
      title: dict.admin.comments.title,
      icon: MessageSquare,
      href: '/admin/comments',
    },
    {
      title: dict.admin.tags.title,
      icon: Tag,
      href: '/admin/tags',
    },
    {
      title: dict.admin.categories.title,
      icon: FolderKanban,
      href: '/admin/categories',
    },
        {
          title: dict.admin.themes.title,
          icon: Palette,
          href: '/admin/themes',
        },
        {
          title: dict.admin.menus || 'Menus',
          icon: Menu,
          href: '/admin/menus',
        },
        {
          title: dict.admin.settings,
     // Still a string in dictionary? No, settings was also updated but not admin.settings. Let me check.
      // Wait, checking zh-CN.json:
      // "admin": { "settings": "设置" } -> This is correct.
      // "settings": { "title": "网站设置" } -> This is the settings page title.
      // So admin.settings is a string.
      icon: Settings,
      href: '/admin/settings',
    },
  ]

  // Avoid hydration mismatch
  const renderThemeIcon = (mode: ThemeMode) => {
    if (!mounted) {
      return <Sun className="w-5 h-5" />
    }
    return themeIcons[mode]
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-4">
          <Link href="/admin" className="text-xl font-bold">
            VeloCMS Admin
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Logo */}
          <div className="hidden lg:flex h-16 items-center justify-between px-6 border-b border-border">
            <Link href="/admin" className="text-lg font-bold">
              VeloCMS Admin
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-accent rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition text-sm ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* User */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-sm">{user?.name || 'Admin'}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email || 'admin@velocms.dev'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-accent rounded-md text-muted-foreground"
                title={dict.admin.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="hidden lg:flex h-14 items-center justify-between border-b border-border px-6">
            <h1 className="text-lg font-semibold">
              {menuItems.find((item) => item.href === pathname)?.title || dict.admin.dashboard}
            </h1>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition"
                title={dict.admin.viewSite}
              >
                <Home className="w-5 h-5" />
              </Link>

              {/* Theme Selector */}
              <div className="relative">
                <button
                  onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                  className="flex items-center gap-1 p-2 hover:bg-accent rounded-lg text-muted-foreground transition"
                  title={dict.admin.theme}
                >
                  {renderThemeIcon(currentTheme)}
                  <ChevronDown className={`w-4 h-4 transition-transform ${themeMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {themeMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setThemeMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-1 w-36 bg-background border border-border rounded-lg shadow-lg z-50 py-1">
                      {(Object.keys(themeLabels) as ThemeMode[]).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => selectTheme(mode)}
                          className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition ${
                            currentTheme === mode ? 'text-primary font-medium' : ''
                          }`}
                        >
                          {renderThemeIcon(mode)}
                          <span>{themeLabels[mode]}</span>
                          {currentTheme === mode && (
                            <span className="ml-auto text-xs">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  )
}
