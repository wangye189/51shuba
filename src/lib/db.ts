import { createClient, type Client } from "@libsql/client";
import bcrypt from "bcryptjs";
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

  -- 面向读者的账号体系（不绑邮箱/手机，账号唯一即可）
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  -- 用户书架（登录后跟账号走、跨设备同步）
  CREATE TABLE IF NOT EXISTS user_shelf (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id    INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, book_id)
  );
  CREATE INDEX IF NOT EXISTS idx_shelf_user ON user_shelf(user_id, created_at DESC);

  -- 后台管理员（与读者 users 表分离）；按铁律预留 TOTP 两步验证字段
  CREATE TABLE IF NOT EXISTS admins (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT NOT NULL UNIQUE,
    password     TEXT NOT NULL,
    totp_secret  TEXT NOT NULL DEFAULT '',
    totp_enabled INTEGER NOT NULL DEFAULT 0,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

async function init(): Promise<Client> {
  const url = process.env.TURSO_DATABASE_URL || "file:data/book51.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const client = createClient(authToken ? { url, authToken } : { url });
  await client.executeMultiple(SCHEMA);
  await seedIfEmpty(client);
  await seedAdmin(client);
  return client;
}

// 首次无管理员时创建默认管理员（账号/密码可用环境变量覆盖）
async function seedAdmin(client: Client): Promise<void> {
  const r = await client.execute("SELECT COUNT(*) AS n FROM admins");
  if (Number(r.rows[0].n) > 0) return;
  const username = process.env.ADMIN_USERNAME || "admin";
  const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin888", 10);
  await client.execute({ sql: "INSERT INTO admins (username, password) VALUES (?, ?)", args: [username, hash] });
}

/** 取数据库连接（首次调用建表 + 灌演示数据，结果 memoize）*/
export function getDb(): Promise<Client> {
  if (!g.__book51db) g.__book51db = init();
  return g.__book51db;
}
