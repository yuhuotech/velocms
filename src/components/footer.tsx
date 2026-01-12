import type { Dictionary } from "@/lib/i18n";
import { Settings } from "lucide-react";

interface FooterProps {
  dict: Dictionary;
  authorName: string;
}

export default function Footer({ dict, authorName }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {dict.footer.copyright
              .replace("{year}", year.toString())
              .replace("{name}", authorName || "Admin")}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{dict.footer.poweredBy}</span>
            <a
              href="/admin"
              className="hover:text-foreground transition-colors"
              title="管理后台"
            >
              <Settings className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
