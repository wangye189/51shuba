// 把本地 data/book51.db 的全部数据推到 Turso 云库（部署上线用）。
// 用法：TURSO_DATABASE_URL=libsql://xxx TURSO_AUTH_TOKEN=xxx node scripts/push-to-turso.mjs
import { createClient } from "@libsql/client";

const URL = process.env.TURSO_DATABASE_URL;
const TOKEN = process.env.TURSO_AUTH_TOKEN;
if (!URL || !TOKEN) {
  console.error("请先设置 TURSO_DATABASE_URL 和 TURSO_AUTH_TOKEN 环境变量");
  process.exit(1);
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '佚名', category TEXT NOT NULL DEFAULT 'xuanhuan', intro TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '连载中', words INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0, source TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')), created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL, idx INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', UNIQUE(book_id, idx));
  CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, idx);
  CREATE INDEX IF NOT EXISTS idx_books_cat ON books(category);
  CREATE TABLE IF NOT EXISTS friend_links (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, domain TEXT NOT NULL DEFAULT '', code TEXT NOT NULL UNIQUE, url TEXT NOT NULL, status INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (datetime('now')));
`;

const src = createClient({ url: "file:data/book51.db" });
const dst = createClient({ url: URL, authToken: TOKEN });

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

async function main() {
  console.log("建表…");
  await dst.executeMultiple(SCHEMA);

  const books = (await src.execute("SELECT * FROM books")).rows;
  const chapters = (await src.execute("SELECT * FROM chapters")).rows;
  let links = [];
  try { links = (await src.execute("SELECT * FROM friend_links")).rows; } catch {}

  console.log(`推送 ${books.length} 本书…`);
  for (const grp of chunk(books, 50)) {
    await dst.batch(
      grp.map((b) => ({
        sql: `INSERT OR REPLACE INTO books (id,title,author,category,intro,cover,status,words,views,source,updated_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [b.id, b.title, b.author, b.category, b.intro, b.cover, b.status, b.words, b.views, b.source, b.updated_at, b.created_at],
      })),
      "write"
    );
  }

  console.log(`推送 ${chapters.length} 章…`);
  for (const grp of chunk(chapters, 100)) {
    await dst.batch(
      grp.map((c) => ({
        sql: `INSERT OR REPLACE INTO chapters (id,book_id,idx,title,content) VALUES (?,?,?,?,?)`,
        args: [c.id, c.book_id, c.idx, c.title, c.content],
      })),
      "write"
    );
  }

  if (links.length) {
    console.log(`推送 ${links.length} 条友链…`);
    await dst.batch(
      links.map((l) => ({
        sql: `INSERT OR REPLACE INTO friend_links (id,name,domain,code,url,status,created_at) VALUES (?,?,?,?,?,?,?)`,
        args: [l.id, l.name, l.domain, l.code, l.url, l.status, l.created_at],
      })),
      "write"
    );
  }

  const n = (await dst.execute("SELECT COUNT(*) AS n FROM chapters")).rows[0].n;
  console.log(`✓ 完成。Turso 现有 ${books.length} 本书 / ${n} 章`);
}

main().catch((e) => { console.error("✗ 失败：", e.message); process.exit(1); });
