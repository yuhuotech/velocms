import type { Metadata } from "next";
import { getSettings } from "./i18n";

export type TitleTemplate =
  | "default"
  | "article"
  | "page"
  | "tag"
  | "search"
  | "admin";

interface PageMetadataOptions {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  template?: TitleTemplate;
}

export async function generatePageMetadata(
  options: PageMetadataOptions = {},
): Promise<Metadata> {
  const settings = await getSettings();
  const { title, description, keywords, ogImage, noIndex, noFollow } = options;

  const siteName = settings.siteName || "VeloCMS";
  const siteDescription =
    settings.siteDescription || "A flexible, multi-theme blog/CMS system";
  const siteUrl = settings.siteUrl || "https://example.com";
  const defaultImage = ogImage || "/images/og-default.jpg";

  const formattedTitle = formatTitle(title, options.template, siteName);

  const metadata: Metadata = {
    title: formattedTitle,
    description: description || siteDescription,
    keywords: keywords || settings.metaKeywords,
    authors: settings.authorName ? [{ name: settings.authorName }] : undefined,
    creator: settings.authorName,
    publisher: settings.authorName,

    openGraph: {
      title: formattedTitle,
      description: description || siteDescription,
      siteName,
      url: siteUrl,
      type: getOGType(options.template),
      locale: settings.language || "zh-CN",
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: formattedTitle,
      description: description || siteDescription,
      images: [defaultImage],
      creator: settings.twitterHandle || undefined,
    },

    robots: {
      index: !noIndex,
      follow: !noFollow,
    },

    other: {
      "og:site_name": siteName,
    },
  };

  if (keywords) {
    metadata.keywords = keywords;
  }

  return metadata;
}

function formatTitle(
  pageTitle: string | undefined,
  template: TitleTemplate | undefined,
  siteName: string,
): string {
  if (!pageTitle) {
    return siteName;
  }

  switch (template) {
    case "article":
      return `${pageTitle} - ${siteName}`;
    case "page":
      return `${pageTitle} - ${siteName}`;
    case "tag":
      return `${pageTitle} - ${siteName}`;
    case "search":
      return `搜索：${pageTitle} - ${siteName}`;
    case "admin":
      return `${pageTitle} - ${siteName} 管理后台`;
    default:
      return `${pageTitle} - ${siteName}`;
  }
}

function getOGType(template: TitleTemplate | undefined): "website" | "article" {
  switch (template) {
    case "article":
      return "article";
    default:
      return "website";
  }
}

export function createArticleMetadata(
  title: string,
  description: string,
  publishedAt: Date,
  authorName: string,
  tags: string[],
  image?: string,
): Metadata {
  return {
    title: `${title} - VeloCMS`,
    description,
    openGraph: {
      type: "article",
      publishedTime: publishedAt.toISOString(),
      authors: [authorName],
      tags,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export function truncateText(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3).trim() + "...";
}
