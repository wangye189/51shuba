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

// ===== 后台管理：写操作 =====
export async function createCategory(slug: string, name: string, channel: string, sort = 0) {
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO categories (slug, name, channel, sort) VALUES (?, ?, ?, ?)",
    args: [slug, name, channel, sort],
  });
}
export async function updateCategory(id: number, name: string, channel: string, sort: number) {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE categories SET name = ?, channel = ?, sort = ? WHERE id = ?",
    args: [name, channel, sort, id],
  });
}
export async function deleteCategory(id: number) {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM categories WHERE id = ?", args: [id] });
}

export async function createChannel(ckey: string, name: string, sort = 0) {
  const db = await getDb();
  await db.execute({
    sql: "INSERT INTO channels (ckey, name, sort) VALUES (?, ?, ?)",
    args: [ckey, name, sort],
  });
}
export async function updateChannel(ckey: string, name: string, sort: number) {
  const db = await getDb();
  await db.execute({ sql: "UPDATE channels SET name = ?, sort = ? WHERE ckey = ?", args: [name, sort, ckey] });
}
export async function deleteChannel(ckey: string) {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM channels WHERE ckey = ?", args: [ckey] });
}
