import type { Dictionary } from '@/lib/i18n'

interface FooterProps {
  dict: Dictionary
  authorName: string
}

export default function Footer({ dict, authorName }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {dict.footer.copyright
              .replace('{year}', year.toString())
              .replace('{name}', authorName || 'Admin')}
          </div>
          <div className="text-sm text-muted-foreground">
            {dict.footer.poweredBy}
          </div>
        </div>
      </div>
    </footer>
  )
}