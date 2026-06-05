import type { MetadataRoute } from "next";
import { allBookIds } from "@/lib/repo";
import { site } from "@/lib/config";
import { getCategories, getChannels } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const [categories, channels] = await Promise.all([getCategories(), getChannels()]);
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.3 },
    // 各频道首页（boy 即根路径，已含；其余 /{ckey}）
    ...channels
      .filter((c) => c.ckey !== "boy")
      .map((c) => ({ url: `${base}/${c.ckey}`, changeFrequency: "daily" as const, priority: 0.9 })),
    // 各频道的排行榜 + 完本
    ...channels.flatMap((c) => {
      const prefix = c.ckey === "boy" ? "" : `/${c.ckey}`;
      return [
        { url: `${base}${prefix}/rank`, changeFrequency: "daily" as const, priority: 0.7 },
        { url: `${base}${prefix}/complete`, changeFrequency: "weekly" as const, priority: 0.7 },
      ];
    }),
    // 分类页
    ...categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  // 只列书页（章节让 Google 通过书详情页内链爬，避免上万 URL 拖垮 sitemap）
  const books = await allBookIds();
  for (const b of books) {
    entries.push({
      url: `${base}/book/${b.id}`,
      lastModified: b.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }
  return entries;
}
