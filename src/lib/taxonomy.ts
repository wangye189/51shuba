import { cache } from "react";
import { getDb } from "./db";

export type ChannelRow = { ckey: string; name: string; sort: number };
export type CategoryRow = { id: number; slug: string; name: string; channel: string; sort: number };

// React cache：同一次请求内多处调用只查一次库
export const getChannels = cache(async (): Promise<ChannelRow[]> => {
  const db = await getDb();
  const r = await db.execute("SELECT ckey, name, sort FROM channels ORDER BY sort, id");
  return r.rows as unknown as ChannelRow[];
});

export const getCategories = cache(async (): Promise<CategoryRow[]> => {
  const db = await getDb();
  const r = await db.execute("SELECT id, slug, name, channel, sort FROM categories ORDER BY sort, id");
  return r.rows as unknown as CategoryRow[];
});

export async function getCategoriesByChannel(channel: string): Promise<CategoryRow[]> {
  return (await getCategories()).filter((c) => c.channel === channel);
}

export async function categoryNameOf(slug: string): Promise<string> {
  return (await getCategories()).find((c) => c.slug === slug)?.name || slug;
}

export async function categoryChannelOf(slug: string): Promise<string> {
  return (await getCategories()).find((c) => c.slug === slug)?.channel || "boy";
}

export async function channelSlugs(channel: string): Promise<string[]> {
  return (await getCategories()).filter((c) => c.channel === channel).map((c) => c.slug);
}

export async function isValidCategory(slug: string): Promise<boolean> {
  return (await getCategories()).some((c) => c.slug === slug);
}
