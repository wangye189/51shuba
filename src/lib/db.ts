import { createClient, type Client } from "@libsql/client";
import { seedIfEmpty } from "./seed";

// 本地开发：file: 本地 SQLite 文件（沿用 data/book51.db，采集数据保留）
// 生产(Vercel)：设 TURSO_DATABASE_URL + TURSO_AUTH_TOKEN → 连 Turso 云库
// 一套代码，环境变量切换，零自有服务器。
const g = globalThis as unknown as { __book51db?: Promise<Client> };

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS books (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    author     TEXT NOT NULL DEFAULT '佚名',
    category   TEXT NOT NULL DEFAULT 'xuanhuan',
    intro      TEXT NOT NULL DEFAULT '',
    cover      TEXT NOT NULL DEFAULT '',
    status     TEXT NOT NULL DEFAULT '连载中',
    words      INTEGER NOT NULL DEFAULT 0,
    views      INTEGER NOT NULL DEFAULT 0,
    source     TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS chapters (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id  INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    idx      INTEGER NOT NULL,
    title    TEXT NOT NULL,
    content  TEXT NOT NULL DEFAULT '',
    UNIQUE(book_id, idx)
  );
  CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, idx);
  CREATE INDEX IF NOT EXISTS idx_books_cat ON books(category);
  CREATE TABLE IF NOT EXISTS friend_links (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    domain     TEXT NOT NULL DEFAULT '',
    code       TEXT NOT NULL UNIQUE,
    url        TEXT NOT NULL,
    status     INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS friend_link_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    link_id    INTEGER NOT NULL REFERENCES friend_links(id) ON DELETE CASCADE,
    type       TEXT NOT NULL,
    ip         TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_fll_link ON friend_link_logs(link_id, type, created_at);
  CREATE INDEX IF NOT EXISTS idx_fll_dedup ON friend_link_logs(link_id, type, ip, created_at);
`;

async function init(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL || "file:data/book51.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  await client.executeMultiple(SCHEMA);
  await seedIfEmpty(client);
  return client;
}

/** 取数据库连接（首次调用建表 + 灌演示数据，结果 memoize）*/
export function getDb(): Promise<Client> {
  if (!g.__book51db) g.__book51db = init();
  return g.__book51db;
}
