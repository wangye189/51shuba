import type { MetadataRoute } from "next";
import { allBookIds, listChapters } from "@/lib/repo";
import { site } from "@/lib/config";
import { getCategories } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url;
  const categories = await getCategories();
  const entries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const books = await allBookIds();
  for (const b of books) {
    entries.push({
      url: `${base}/book/${b.id}`,
      lastModified: b.updated_at,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    const chs = await listChapters(b.id);
    for (const ch of chs) {
      entries.push({
        url: `${base}/book/${b.id}/${ch.idx}`,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }
  return entries;
}
