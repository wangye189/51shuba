#!/usr/bin/env node
// IndexNow 提交：把 sitemap 里的 URL 推送给 Bing/Yandex 等（即时收录）。
// 用法：NEXT_PUBLIC_SITE_URL=https://你的域名 INDEXNOW_KEY=xxx node scripts/indexnow.mjs
// 注意：public/<INDEXNOW_KEY>.txt 必须存在且内容等于 key（已放置默认 key 文件）。
// Google 不支持 IndexNow，Google 走 sitemap 自动发现 + GSC 手动提交（人工）。

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const KEY = process.env.INDEXNOW_KEY || "a1b2c3d4e5f60718293a4b5c6d7e8f90";

async function main() {
  const host = new URL(SITE).host;
  const smRes = await fetch(`${SITE}/sitemap.xml`);
  if (!smRes.ok) throw new Error(`无法获取 sitemap: ${smRes.status}`);
  const xml = await smRes.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (urls.length === 0) throw new Error("sitemap 里没有 URL");

  console.log(`准备提交 ${urls.length} 条 URL 到 IndexNow（host=${host}）`);
  const body = {
    host,
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList: urls,
  };
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow 响应：${res.status} ${res.statusText}`);
  if (res.status === 200 || res.status === 202) console.log("✓ 提交成功");
  else console.log("响应体：", await res.text().catch(() => ""));
}

main().catch((e) => {
  console.error("✗ 失败：", e.message);
  process.exit(1);
});
