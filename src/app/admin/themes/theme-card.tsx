'use client'

import { useState, useTransition } from 'react'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import type { ThemeInfo } from '@/lib/theme'

interface ThemeCardProps {
  theme: ThemeInfo
  isActive: boolean
}

export function ThemeCard({ theme, isActive }: ThemeCardProps) {
  const [isPending, startTransition] = useTransition()
  const [localActive, setLocalActive] = useState(isActive)

  const handleActivate = () => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/themes/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ themeName: theme.name }),
        })

        if (response.ok) {
          setLocalActive(true)
          // Optionally reload to apply theme
        }
      } catch (error) {
        console.error('Failed to activate theme:', error)
      }
    })
  }

  return (
    <div className={`border rounded-lg overflow-hidden transition-all ${
      localActive ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'
    }`}>
      {/* Preview */}
      <div className="h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        {theme.screenshot ? (
          <img
            src={theme.screenshot}
            alt={theme.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-4xl font-bold text-primary/20">{theme.name[0]?.toUpperCase()}</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-lg capitalize">{theme.name}</h3>
            <p className="text-xs text-muted-foreground">v{theme.version}</p>
          </div>
          {localActive && (
            <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
              <Check className="w-3 h-3" />
              已启用
            </span>
          )}
        </div>

        {theme.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {theme.description}
          </p>
        )}

        {theme.author && (
          <p className="text-xs text-muted-foreground mb-3">
            作者: {theme.author.name}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleActivate}
            disabled={localActive || isPending}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : localActive ? (
              '已启用'
            ) : (
              <>
                启用
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>

          <button
            className="px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-accent transition-colors"
          >
            设置
          </button>
        </div>
      </div>
    </div>
  )
}

export default ThemeCard
