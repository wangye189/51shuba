// 把浏览器采集下载的 JSON（b51_<id>_<a>-<b>.json）入库。
// 用法：node scripts/load-69shuba.mjs /path/to/b51_90442_1-5.json [更多文件...]
import fs from "node:fs";
import { upsertBook, addChapter, recomputeWords } from "./ingest.mjs";

// 69shuba 分类 → 本站 6 大类
const CAT_MAP = [
  [/玄幻|奇幻|魔法|霍格/, "xuanhuan"],
  [/武侠|仙侠|修真|修仙/, "wuxia"],
  [/都市|职场|官场|现实|青春|娱乐/, "dushi"],
  [/言情|情感|总裁|婚恋|女生/, "yanqing"],
  [/历史|军事|架空|穿越/, "lishi"],
  [/科幻|游戏|竞技|灵异|悬疑|无限/, "kehuan"],
];
function mapCategory(c) {
  for (const [re, slug] of CAT_MAP) if (re.test(c || "")) return slug;
  return "xuanhuan";
}
const mapStatus = (s) => (/完|结束|完本|完结/.test(s || "") ? "已完结" : "连载中");

function load(file) {
  const d = JSON.parse(fs.readFileSync(file, "utf8"));
  const b = d.book;
  const bookId = upsertBook({
    title: b.title,
    author: b.author,
    category: mapCategory(b.category),
    intro: b.intro,
    status: mapStatus(b.status),
    source: `69shuba:${b.bookId}`,
  });
  let added = 0;
  for (const ch of d.chapters) {
    if (ch.content && ch.content.length > 0 && addChapter(bookId, ch.idx, ch.title, ch.content)) added++;
  }
  const words = recomputeWords(bookId);
  console.log(
    `✓ ${b.title}（${b.author}）→ bookId=${bookId} | 本次新增 ${added} 章 | ` +
      `原分类「${b.category}」→ ${mapCategory(b.category)} | 累计字数 ${words} | 全书共 ${d.totalChapters} 章`
  );
}

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("用法：node scripts/load-69shuba.mjs <json文件> [...]");
  process.exit(1);
}
files.forEach(load);
console.log("入库完成。");
