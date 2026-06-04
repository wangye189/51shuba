# 69shuba 采集说明

> ⚠️ 版权：采集/转载他人小说属侵权，平台方担责；接 AdSense 大概率被拒。风险自负。
> ⚠️ 反爬：69shuba 挂 Cloudflare 真人验证，**必须在你本人浏览器里过墙后采集**。不破解验证码。

## 为什么不能纯脚本跑

正文页在 `www.69shuba.com`，挂了 Cloudflare Managed Challenge（"Just a moment..."）。
纯 Node/curl 一律 403。必须用**你真人过墙后的浏览器会话**（同源 fetch 自动带 cf_clearance）。

## 站点结构（已验证）

| 类型 | URL | 解析 |
|---|---|---|
| 书页 | `/book/{id}.htm` | `og:title/og:novel:author/og:novel:category/og:novel:status/og:description` |
| 目录 | `/book/{id}/` | `#catalog li a` → `/txt/{id}/{cid}`，**按 cid 升序 = 阅读顺序** |
| 正文 | `/txt/{id}/{cid}` | `.txtnav`，剥掉 `h1/.txtinfo/#txtright/div/a/ins`，`<br>` 转段落 |

编码：**GBK**（fetch 后必须 `new TextDecoder('gbk')` 解码）。

## 采集流程（3 步）

1. **浏览器过墙**：Chrome 打开 `www.69shuba.com` 任一书/章节页，手动过 Cloudflare 验证。
2. **控制台采集**：F12 控制台，粘贴 `scripts/crawl69-inpage.js` 全文，回车。然后：
   ```js
   await crawl69batch(90442, 1, 50)     // 分批采，攒进内存
   await crawl69batch(90442, 51, 100)
   // ... 直到覆盖全书（返回值显示总章数）
   crawl69save(90442)                   // 打包下载成 ~/Downloads/b51_90442_all.json
   ```
   小书可一步：`await crawl69(90442, 1, 30)`（采并立刻下载）
3. **入库**：项目根执行
   ```bash
   node scripts/load-69shuba.mjs ~/Downloads/b51_90442_all.json
   ```
   - 自动映射分类（如「官场职场」→ dushi）、状态、字数
   - 章节按 idx 去重，可重复跑、断点续采安全

## 文件

- `crawl69-inpage.js` — 浏览器控制台采集器（过墙会话内同源抓取）
- `load-69shuba.mjs` — 把下载的 JSON 入库（分类映射 + 去重）
- `ingest.mjs` — 通用入库管线（upsertBook / addChapter / 字数统计）
