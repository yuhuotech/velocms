import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowLeft } from "lucide-react";
import LoginForm from "./login-form";
import { getSettings, getDictionary } from "@/lib/i18n";
import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return generatePageMetadata({
    title: "登录",
    description: `${settings.siteName || "VeloCMS"} 管理后台登录`,
    template: "admin",
    noIndex: true,
    noFollow: true,
  });
}

export default async function LoginPage() {
  const settings = await getSettings();
  const dict = await getDictionary(settings.language);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <div className="relative w-10 h-10">
              <Image
                src={settings.logoUrl || "/logo.png"}
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold">
            {settings.siteName || "VeloCMS"}
          </h1>
          <p className="text-muted-foreground mt-2">{dict.auth.loginTitle}</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <LoginForm dict={dict} />
          </Suspense>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {dict.auth.backToHome}
          </Link>
          <p className="text-sm text-muted-foreground">{dict.auth.adminOnly}</p>
        </div>
      </div>
    </div>
  );
}
