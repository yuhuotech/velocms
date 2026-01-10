import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return generatePageMetadata({
    title: "文件管理",
    description: "管理上传的文件",
    template: "admin",
  });
}

export default function FilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
