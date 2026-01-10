"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search, Moon, Sun, Monitor, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import type { Dictionary } from "@/lib/i18n";

type ThemeMode = "light" | "dark" | "system";

const themeIcons: Record<ThemeMode, React.ReactNode> = {
  light: <Sun className="w-5 h-5" />,
  dark: <Moon className="w-5 h-5" />,
  system: <Monitor className="w-5 h-5" />,
};

interface NavbarClientProps {
  dict: Dictionary;
  menus: any[];
  siteName?: string;
}

export default function NavbarClient({
  dict,
  menus,
  siteName,
}: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme: ThemeMode = (theme as ThemeMode) || "system";

  const themeLabels: Record<ThemeMode, string> = {
    light: dict.nav.theme.light,
    dark: dict.nav.theme.dark,
    system: dict.nav.theme.system,
  };

  const selectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    setThemeMenuOpen(false);
  };

  const renderThemeIcon = (mode: ThemeMode) => {
    if (!mounted) {
      return <Sun className="w-5 h-5" />;
    }
    return themeIcons[mode];
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-8 h-8">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold hidden sm:block">
              {siteName || "VeloCMS"}
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {menus.map((menu: any) => (
              <Link
                key={menu.id}
                href={menu.url}
                target={menu.target}
                className="text-sm font-medium hover:text-primary transition"
              >
                {menu.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Link
              href="/search"
              className="p-2 hover:bg-accent rounded-lg transition"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setThemeMenuOpen(!themeMenuOpen)}
                className="flex items-center gap-1 p-2 hover:bg-accent rounded-lg transition"
              >
                {renderThemeIcon(currentTheme)}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${themeMenuOpen ? "rotate-180" : ""}`}
                />
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
                          currentTheme === mode
                            ? "text-primary font-medium"
                            : ""
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

            <button
              className="md:hidden p-2 hover:bg-accent rounded-lg transition"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-3">
              {menus.map((menu: any) => (
                <Link
                  key={menu.id}
                  href={menu.url}
                  target={menu.target}
                  className="text-sm font-medium hover:text-primary transition"
                  onClick={() => setIsOpen(false)}
                >
                  {menu.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
