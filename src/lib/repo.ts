import { getDb } from "./db";

export type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  intro: string;
  cover: string;
  status: string;
  words: number;
  views: number;
  source: string;
  updated_at: string;
};

export type Chapter = {
  id: number;
  book_id: number;
  idx: number;
  title: string;
  content: string;
};

export async function listBooks(opts: { category?: string; limit?: number } = {}): Promise<Book[]> {
  const { category, limit = 60 } = opts;
  const db = await getDb();
  const r = category
    ? await db.execute({
        sql: `SELECT * FROM books WHERE category = ? ORDER BY updated_at DESC LIMIT ?`,
        args: [category, limit],
      })
    : await db.execute({ sql: `SELECT * FROM books ORDER BY updated_at DESC LIMIT ?`, args: [limit] });
  return r.rows as unknown as Book[];
}

export async function getBook(id: number): Promise<Book | undefined> {
  const db = await getDb();
  const r = await db.execute({ sql: `SELECT * FROM books WHERE id = ?`, args: [id] });
  return r.rows[0] as unknown as Book | undefined;
}

export async function listChapters(bookId: number): Promise<Pick<Chapter, "idx" | "title">[]> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT idx, title FROM chapters WHERE book_id = ? ORDER BY idx ASC`,
    args: [bookId],
  });
  return r.rows as unknown as Pick<Chapter, "idx" | "title">[];
}

export async function getChapter(bookId: number, idx: number): Promise<Chapter | undefined> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT * FROM chapters WHERE book_id = ? AND idx = ?`,
    args: [bookId, idx],
  });
  return r.rows[0] as unknown as Chapter | undefined;
}

export async function chapterCount(bookId: number): Promise<number> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT COUNT(*) AS n FROM chapters WHERE book_id = ?`,
    args: [bookId],
  });
  return Number(r.rows[0].n);
}

export async function incView(id: number): Promise<void> {
  const db = await getDb();
  await db.execute({ sql: `UPDATE books SET views = views + 1 WHERE id = ?`, args: [id] });
}

// sitemap 用：全部书 id + 更新时间
export async function allBookIds(): Promise<{ id: number; updated_at: string }[]> {
  const db = await getDb();
  const r = await db.execute(`SELECT id, updated_at FROM books`);
  return r.rows as unknown as { id: number; updated_at: string }[];
}

// 构建时静态预渲染用：全部 (书id, 章节序号)
export async function allChapterParams(): Promise<{ book_id: number; idx: number }[]> {
  const db = await getDb();
  const r = await db.execute(`SELECT book_id, idx FROM chapters`);
  return r.rows as unknown as { book_id: number; idx: number }[];
}

// ===== 首页榜单/列表 =====
export type BookRow = Book & { last_title: string | null; last_idx: number | null; chap_count: number };

const ROW_SELECT = `
  SELECT b.*,
         (SELECT title FROM chapters c WHERE c.book_id = b.id ORDER BY c.idx DESC LIMIT 1) AS last_title,
         (SELECT idx   FROM chapters c WHERE c.book_id = b.id ORDER BY c.idx DESC LIMIT 1) AS last_idx,
         (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id) AS chap_count
  FROM books b`;

async function rows(sql: string, args: (string | number)[] = []): Promise<BookRow[]> {
  const db = await getDb();
  const r = await db.execute({ sql, args });
  return r.rows as unknown as BookRow[];
}

export function latestUpdated(limit = 15): Promise<BookRow[]> {
  return rows(`${ROW_SELECT} ORDER BY b.updated_at DESC, b.id DESC LIMIT ?`, [limit]);
}

export function hotRanking(limit = 10): Promise<BookRow[]> {
  return rows(`${ROW_SELECT} ORDER BY b.views DESC, b.id DESC LIMIT ?`, [limit]);
}

export function featured(limit = 6): Promise<BookRow[]> {
  return hotRanking(limit);
}

export function relatedBooks(category: string, excludeId: number, limit = 8): Promise<BookRow[]> {
  return rows(`${ROW_SELECT} WHERE b.category = ? AND b.id != ? ORDER BY b.views DESC LIMIT ?`, [
    category,
    excludeId,
    limit,
  ]);
}

export function searchBooks(q: string, limit = 50): Promise<BookRow[]> {
  const kw = `%${q.trim()}%`;
  return rows(`${ROW_SELECT} WHERE b.title LIKE ? OR b.author LIKE ? ORDER BY b.views DESC LIMIT ?`, [
    kw,
    kw,
    limit,
  ]);
}

// ===== 用户体系 =====
export type User = { id: number; username: string; password: string };

export async function createUser(username: string, passwordHash: string): Promise<number> {
  const db = await getDb();
  const r = await db.execute({
    sql: `INSERT INTO users (username, password) VALUES (?, ?)`,
    args: [username, passwordHash],
  });
  return Number(r.lastInsertRowid);
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  const r = await db.execute({
    sql: `SELECT id, username, password FROM users WHERE username = ?`,
    args: [username],
  });
  return r.rows[0] as unknown as User | undefined;
}

// ===== 用户书架（登录后跟账号走）=====
export async function getUserShelf(userId: number): Promise<BookRow[]> {
  return rows(
    `${ROW_SELECT}
     JOIN user_shelf s ON s.book_id = b.id
     WHERE s.user_id = ?
     ORDER BY s.created_at DESC`,
    [userId],
  );
}

export async function shelfBookIds(userId: number): Promise<number[]> {
  const db = await getDb();
  const r = await db.execute({ sql: `SELECT book_id FROM user_shelf WHERE user_id = ?`, args: [userId] });
  return r.rows.map((x) => Number((x as unknown as { book_id: number }).book_id));
}

export async function addToShelf(userId: number, bookId: number): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `INSERT OR IGNORE INTO user_shelf (user_id, book_id) VALUES (?, ?)`,
    args: [userId, bookId],
  });
}

export async function removeFromShelf(userId: number, bookId: number): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `DELETE FROM user_shelf WHERE user_id = ? AND book_id = ?`,
    args: [userId, bookId],
  });
}
