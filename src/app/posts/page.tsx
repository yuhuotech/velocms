import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PostCard from "@/components/post-card";
import Sidebar from "@/components/sidebar";
import type { Metadata } from "next";
import { getSettings, getDictionary } from "@/lib/i18n";
import { postRepository, tagRepository } from "@/db/repositories";
import { db } from "@/db/client";
import { generatePageMetadata } from "@/lib/seo";

// Fetch posts
async function getPosts() {
  await db.initialize();
  const posts = await postRepository.findAll({ status: "published" });
  const recentPosts = await postRepository.getRecent(5);
  const popularTags = await tagRepository.getPopular(10);

  return {
    posts: posts || [],
    recentPosts: recentPosts || [],
    popularTags: popularTags || [],
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary("zh-CN");
  return generatePageMetadata({
    title: dict.posts.title,
    description: dict.posts.count.replace("{count}", "0"),
    template: "default",
  });
}

export default async function PostsPage() {
  const { posts, recentPosts, popularTags } = await getPosts();
  const settings = await getSettings();
  const dict = await getDictionary(settings.language);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar dict={dict} />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-4">{dict.posts.title}</h1>
            <p className="text-lg text-muted-foreground">
              {dict.posts.count.replace("{count}", posts.length.toString())}
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Posts List */}
              <div className="space-y-6">
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
                  <p className="text-muted-foreground">{dict.posts.empty}</p>
                </div>
              )}

              {/* Pagination */}
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
                  2
                </button>
                <button className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">
                  {dict.posts.pagination.next}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Sidebar
                recentPosts={recentPosts}
                popularTags={popularTags}
                dict={dict}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer dict={dict} authorName={settings.authorName || "Admin"} />
    </div>
  );
}
