// 批量入库：浏览器采集下载的 b51_bulk_N.json（{books:[{book,chapters}]}）入本地库。
// 用法：node scripts/load-bulk.mjs ~/Downloads/b51_bulk_1.json [...]
import fs from "node:fs";
import { upsertBook, addChapter, recomputeWords } from "./ingest.mjs";

const CAT_MAP = [
  [/玄幻|奇幻|魔法|霍格|仙侠|修真|修仙|武侠/, "xuanhuan"],
  [/武侠|仙侠/, "wuxia"],
  [/都市|职场|官场|现实|青春|娱乐|生活/, "dushi"],
  [/言情|情感|总裁|婚恋|女生|宫斗|古言/, "yanqing"],
  [/历史|军事|架空|穿越|三国|大明/, "lishi"],
  [/科幻|游戏|竞技|灵异|悬疑|无限|末世/, "kehuan"],
];
const mapCategory = (c) => { for (const [re, s] of CAT_MAP) if (re.test(c || "")) return s; return "xuanhuan"; };
const mapStatus = (s) => (/完|结束|完本|完结/.test(s || "") ? "已完结" : "连载中");

let totalBooks = 0, totalCh = 0;
function load(file) {
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const books = d.books || (d.book ? [{ book: d.book, chapters: d.chapters }] : []);
  for (const { book: b, chapters } of books) {
    if (!b || !b.title) continue;
    const bookId = upsertBook({
      title: b.title, author: b.author, category: mapCategory(b.category),
      intro: b.intro, status: mapStatus(b.status), source: `69shuba:${b.bookId}`,
    });
    let added = 0;
    for (const ch of chapters || []) {
      if (ch.content && ch.content.length > 0 && addChapter(bookId, ch.idx, ch.title, ch.content)) added++;
    }
    recomputeWords(bookId);
    totalBooks++; totalCh += added;
    console.log(`  ✓ ${b.title}（${b.author}）${mapCategory(b.category)} +${added}章 [全书${b.fullTotal || "?"}章]`);
  }
}

const files = process.argv.slice(2);
if (!files.length) { console.error("用法: node scripts/load-bulk.mjs <文件...>"); process.exit(1); }
files.forEach(load);
console.log(`入库完成：本次 ${totalBooks} 本 / ${totalCh} 章`);
