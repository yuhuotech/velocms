import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Sidebar from "@/components/sidebar";
import PostCard from "@/components/post-card";
import { Tag as TagIcon } from "lucide-react";
import Link from "next/link";
import { getSettings, getDictionary } from "@/lib/i18n";
import { postRepository, tagRepository } from "@/db/repositories";
import { db } from "@/db/client";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await db.initialize();
  const { slug } = await params;
  const tag = await tagRepository.findBySlug(slug);

  if (!tag) {
    return {
      title: "标签未找到 - VeloCMS",
    };
  }

  return generatePageMetadata({
    title: `${tag.name} 标签`,
    description: `查看所有标记为 "${tag.name}" 的文章`,
    keywords: tag.name,
    template: "tag",
  });
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await db.initialize();
  const { slug } = await params;

  const settings = await getSettings();
  const dict = await getDictionary(settings.language);

  const tag = await tagRepository.findBySlug(slug);
  if (!tag) {
    notFound();
  }

  const posts = await postRepository.findByTag(slug);
  const popularTags = await tagRepository.getPopular(10);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <Link
              href="/tags"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4 transition"
            >
              ← {dict.tags.back}
            </Link>
            <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
              <TagIcon className="w-10 h-10 text-primary" />
              {tag.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              {dict.tags.postCount.replace(
                "{count}",
                (tag.count || 0).toString(),
              )}
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {posts.map((post: any) => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    publishedAt={new Date(post.publishedAt)}
                    readingTime={post.readingTime}
                    tags={post.tags}
                  />
                ))}
              </div>

              {/* Empty State */}
              {posts.length === 0 && (
                <div className="text-center py-12 border border-border rounded-lg">
                  <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{dict.tags.empty}</p>
                </div>
              )}

              {/* Pagination */}
              {posts.length > 0 && (
                <div className="flex justify-center gap-2 pt-8">
                  <button
                    disabled
                    className="px-4 py-2 border border-border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {dict.posts.pagination.prev}
                  </button>
                  <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">
                    1
                  </button>
                  <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                    {dict.posts.pagination.next}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-4 space-y-4 sticky top-4">
                <h3 className="text-sm font-semibold">
                  {dict.sidebar.popularTags}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags
                    .filter((t: any) => t.slug !== slug)
                    .map((t: any) => (
                      <Link
                        key={t.slug}
                        href={`/tags/${t.slug}`}
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-muted hover:bg-primary hover:text-primary-foreground rounded transition"
                      >
                        <TagIcon className="w-3 h-3" />
                        {t.name}
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer dict={dict} authorName={settings.authorName || "Admin"} />
    </div>
  );
}
