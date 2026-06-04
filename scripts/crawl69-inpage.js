/* ===== 69shuba 采集器（浏览器控制台版）=====
 * 因为 69shuba 挂 Cloudflare 真人验证，必须在「你已过墙的浏览器」里跑（同源 fetch 带你的会话）。
 *
 * 用法（在 www.69shuba.com 任一已过墙页面的控制台粘贴本文件后）：
 *   1) await crawl69batch(90442, 1, 50)     // 采 1~50 章，攒进内存，可多次调不同区间
 *   2) await crawl69batch(90442, 51, 100)
 *      ...直到覆盖全书（总章数见返回值）
 *   3) crawl69save(90442)                    // 把攒的全部章节 + 书籍信息打包下载成一个 JSON
 *   4) 终端：node scripts/load-69shuba.mjs ~/Downloads/b51_90442_all.json
 *
 * 小批量一步到位：  await crawl69(90442, 1, 30)   // 采并立刻下载这一批
 */
(() => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const dec = (buf) => new TextDecoder("gbk").decode(buf); // 69shuba 是 GBK
  const BASE = "https://www.69shuba.com";
  const DELAY = 450; // 礼貌延时，别把人站点打挂

  async function fetchDoc(url) {
    const r = await fetch(url, { credentials: "include" });
    return new DOMParser().parseFromString(dec(await r.arrayBuffer()), "text/html");
  }
  async function getMeta(bookId) {
    const d = await fetchDoc(`${BASE}/book/${bookId}.htm`);
    const m = (p) => {
      const e = d.querySelector(`meta[property="${p}"],meta[name="${p}"]`);
      return e ? e.content : "";
    };
    return {
      bookId,
      title: m("og:title"),
      author: m("og:novel:author"),
      category: m("og:novel:category"),
      status: m("og:novel:status"),
      intro: (m("og:description") || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim(),
    };
  }
  async function getCatalog(bookId) {
    const d = await fetchDoc(`${BASE}/book/${bookId}/`);
    const map = new Map();
    d.querySelectorAll("#catalog li a").forEach((a) => {
      const h = a.getAttribute("href");
      const mm = h && h.match(/\/txt\/\d+\/(\d+)/);
      if (mm) map.set(h, { cid: Number(mm[1]), title: a.textContent.trim(), url: h });
    });
    // 用章节 id 升序 = 真实阅读顺序
    return [...map.values()].sort((x, y) => x.cid - y.cid);
  }
  function extract(doc, title) {
    const s = doc.querySelector(".txtnav");
    if (!s) return "";
    s.querySelectorAll("h1,.txtinfo,#txtright,script,ins,style,div,a").forEach((n) => n.remove());
    let t = s.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
    const ta = document.createElement("textarea");
    ta.innerHTML = t;
    t = ta.value;
    let p = t.split(/\n+/).map((x) => x.replace(/ /g, " ").trim()).filter(Boolean);
    if (p[0] && (p[0] === title || title.includes(p[0]))) p.shift();
    return p.filter((x) => x !== "(本章完)").join("\n\n");
  }
  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  window.__crawlAcc = window.__crawlAcc || {}; // bookId -> {meta,total,chapters[]}

  // 采一个区间，攒进内存（不下载）
  window.crawl69batch = async (bookId, start, end) => {
    const acc = (window.__crawlAcc[bookId] = window.__crawlAcc[bookId] || { chapters: [], seen: new Set() });
    if (!acc.meta) acc.meta = await getMeta(bookId);
    if (!acc.catalog) acc.catalog = await getCatalog(bookId);
    acc.total = acc.catalog.length;
    const slice = acc.catalog.slice(start - 1, end);
    for (let i = 0; i < slice.length; i++) {
      const idx = start + i;
      if (acc.seen.has(idx)) continue;
      const d = await fetchDoc(slice[i].url);
      acc.chapters.push({ idx, title: slice[i].title, content: extract(d, slice[i].title) });
      acc.seen.add(idx);
      await sleep(DELAY);
    }
    acc.chapters.sort((a, b) => a.idx - b.idx);
    return `攒入 ${acc.meta.title}：已采 ${acc.chapters.length}/${acc.total} 章（本批 ${start}-${end}）`;
  };

  // 把攒的全部下载成一个 JSON
  window.crawl69save = (bookId) => {
    const acc = window.__crawlAcc[bookId];
    if (!acc) return "该书还没采，先 crawl69batch";
    download(`b51_${bookId}_all.json`, {
      book: acc.meta,
      totalChapters: acc.total,
      chapters: acc.chapters,
    });
    return `已下载 ${acc.meta.title} 共 ${acc.chapters.length} 章`;
  };

  // 小批量：采并立刻下载
  window.crawl69 = async (bookId, start, end) => {
    delete window.__crawlAcc[bookId];
    await window.crawl69batch(bookId, start, end);
    return window.crawl69save(bookId);
  };

  return "crawl69 已就绪：crawl69batch(id,a,b) / crawl69save(id) / crawl69(id,a,b)";
})();
