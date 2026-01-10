import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SearchClient from "./search-client";
import type { Metadata } from "next";
import { getSettings, getDictionary } from "@/lib/i18n";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "",
    description: "搜索文章",
    template: "search",
  });
}

export default async function SearchPage() {
  const settings = await getSettings();
  const dict = await getDictionary(settings.language);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />
      <main className="flex-1">
        <SearchClient dict={dict} />
      </main>
      <Footer dict={dict} authorName={settings.authorName || "Admin"} />
    </div>
  );
}
