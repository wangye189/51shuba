// 采集入库管线（与来源无关）：负责把抓到的书/章节写进 data/book51.db。
// 解析层(各站不同)调用这里的函数即可。可重复运行，断点续采安全。
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "book51.db"));
db.pragma("journal_mode = WAL");

// 保证表存在（与 Next 端 src/lib/db.ts 同构，独立运行也能建表）
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL, author TEXT NOT NULL DEFAULT '佚名',
    category TEXT NOT NULL DEFAULT 'xuanhuan', intro TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '连载中',
    words INTEGER NOT NULL DEFAULT 0, views INTEGER NOT NULL DEFAULT 0,
    source TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    idx INTEGER NOT NULL, title TEXT NOT NULL, content TEXT NOT NULL DEFAULT '',
    UNIQUE(book_id, idx)
  );
`);

/** 新增或复用书（按 source_url 或 title+author 去重），返回 bookId */
export function upsertBook(b) {
  const existing = db
    .prepare(`SELECT id FROM books WHERE title = ? AND author = ?`)
    .get(b.title, b.author);
  if (existing) {
    db.prepare(
      `UPDATE books SET intro=COALESCE(NULLIF(@intro,''),intro),
        category=@category, status=@status, source=@source,
        updated_at=datetime('now') WHERE id=@id`
    ).run({ ...b, id: existing.id });
    return existing.id;
  }
  const r = db
    .prepare(
      `INSERT INTO books (title, author, category, intro, status, source)
       VALUES (@title, @author, @category, @intro, @status, @source)`
    )
    .run({
      title: b.title,
      author: b.author || "佚名",
      category: b.category || "xuanhuan",
      intro: b.intro || "",
      status: b.status || "连载中",
      source: b.source || "",
    });
  return Number(r.lastInsertRowid);
}

/** 写章节（断点续采：已存在的 idx 跳过）。返回 true=新写入 */
export function addChapter(bookId, idx, title, content) {
  const r = db
    .prepare(
      `INSERT OR IGNORE INTO chapters (book_id, idx, title, content) VALUES (?, ?, ?, ?)`
    )
    .run(bookId, idx, title, content || "");
  return r.changes > 0;
}

/** 某书已采集的章节 idx 集合（用于断点续采/跳过）*/
export function existingChapterIdx(bookId) {
  return new Set(
    db.prepare(`SELECT idx FROM chapters WHERE book_id = ?`).all(bookId).map((r) => r.idx)
  );
}

/** 重算并写入书的字数 */
export function recomputeWords(bookId) {
  const row = db
    .prepare(`SELECT COALESCE(SUM(LENGTH(content)),0) AS w FROM chapters WHERE book_id = ?`)
    .get(bookId);
  db.prepare(`UPDATE books SET words = ? WHERE id = ?`).run(row.w, bookId);
  return row.w;
}

export { db };
