// 把 69shuba 采集的 b51_*.json 安全直推到 Turso（或本地 file: 库）。
//
// 为什么不用 push-to-turso.mjs：那个脚本带【显式 id】INSERT OR REPLACE，
// 若来源库 id 与生产库已有 id 撞上会覆盖现有书。本脚本按 source 标记去重，
// 新书让数据库自增分配 id，幂等安全，可反复跑 / 断点续采。
//
// 用法：
//   set -a; . /opt/book51-ingest/.env; set +a    # 载入 TURSO_*
//   node scripts/ingest-turso.mjs incoming/*.json
//   # 测试（不碰生产）：DB_URL=file:data/test.db node scripts/ingest-turso.mjs xxx.json
import fs from "node:fs";
import { createClient } from "@libsql/client";

const URL = process.env.DB_URL || process.env.TURSO_DATABASE_URL;
const TOKEN = process.env.DB_URL ? undefined : process.env.TURSO_AUTH_TOKEN;
if (!URL) {
  console.error("请设置 TURSO_DATABASE_URL（或测试用 DB_URL=file:...）");
  process.exit(1);
}
const db = createClient({ url: URL, authToken: TOKEN });

// 69shuba 分类 → 本站 6 大类（与 load-69shuba.mjs 保持一致）
const CAT_MAP = [
  [/玄幻|奇幻|魔法|霍格/, "xuanhuan"],
  [/武侠|仙侠|修真|修仙/, "wuxia"],
  [/都市|职场|官场|现实|青春|娱乐/, "dushi"],
  [/言情|情感|总裁|婚恋|女生/, "yanqing"],
  [/历史|军事|架空|穿越/, "lishi"],
  [/科幻|游戏|竞技|灵异|悬疑|无限/, "kehuan"],
];
const mapCategory = (c) => (CAT_MAP.find(([re]) => re.test(c || "")) || [, "xuanhuan"])[1];
const mapStatus = (s) => (/完|结束|完本|完结/.test(s || "") ? "已完结" : "连载中");

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '佚名', category TEXT NOT NULL DEFAULT 'xuanhuan', intro TEXT NOT NULL DEFAULT '', cover TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '连载中', words INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0, source TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')), created_at TEXT NOT NULL DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS chapters (id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER NOT NULL, idx INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '', UNIQUE(book_id, idx));
  CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, idx);
  CREATE INDEX IF NOT EXISTS idx_books_cat ON books(category);
`;

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/** 按 source 去重 upsert 一本书，返回 bookId（绝不指定显式 id，避免撞生产）*/
async function upsertBook(b) {
  const source = `69shuba:${b.bookId}`;
  const cat = mapCategory(b.category);
  const status = mapStatus(b.status);
  const found = (await db.execute({ sql: "SELECT id FROM books WHERE source = ?", args: [source] })).rows[0];
  if (found) {
    await db.execute({
      sql: `UPDATE books SET intro=COALESCE(NULLIF(?,''),intro), category=?, status=?, updated_at=datetime('now') WHERE id=?`,
      args: [b.intro || "", cat, status, found.id],
    });
    return Number(found.id);
  }
  const r = await db.execute({
    sql: `INSERT INTO books (title, author, category, intro, status, source) VALUES (?,?,?,?,?,?)`,
    args: [b.title || "", b.author || "佚名", cat, b.intro || "", status, source],
  });
  return Number(r.lastInsertRowid);
}

async function ingest(file) {
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const bookId = await upsertBook(d.book);
  let added = 0;
  for (const grp of chunk(d.chapters.filter((c) => c.content), 100)) {
    const res = await db.batch(
      grp.map((c) => ({
        sql: `INSERT OR IGNORE INTO chapters (book_id, idx, title, content) VALUES (?,?,?,?)`,
        args: [bookId, c.idx, c.title || "", c.content || ""],
      })),
      "write"
    );
    added += res.reduce((s, r) => s + (r.rowsAffected || 0), 0);
  }
  await db.execute({
    sql: `UPDATE books SET words=(SELECT COALESCE(SUM(LENGTH(content)),0) FROM chapters WHERE book_id=?) WHERE id=?`,
    args: [bookId, bookId],
  });
  console.log(`✓ ${d.book.title}（${d.book.author}）→ id=${bookId} | 新增 ${added} 章 | 分类 ${mapCategory(d.book.category)} | 全书 ${d.totalChapters} 章`);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error("用法：node scripts/ingest-turso.mjs <b51_*.json> [...]");
  process.exit(1);
}
await db.executeMultiple(SCHEMA);
for (const f of files) await ingest(f);
console.log(`入库完成，共处理 ${files.length} 个文件。`);
