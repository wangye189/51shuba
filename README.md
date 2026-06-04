# 51书库（book51）

Next.js 16 + SQLite 的小说网站，广告位做成**可插拔**（AdSense / 第三方联盟通用），并预埋 Google Analytics + Google Ads 转化跟踪。

## 跑起来

```bash
npm install
npm run dev          # http://localhost:3000（或 -p 指定端口）
```

首次启动自动建库 `data/book51.db` 并写入演示数据（公版古籍：西游记/三国演义/聊斋志异）。

## 目录

```
src/
  app/
    page.tsx                    首页（书库）
    book/[id]/page.tsx          书详情 + 章节目录
    book/[id]/[chapter]/page.tsx 章节阅读页（核心）
    category/[slug]/page.tsx    分类页
    sitemap.ts / robots.ts      SEO
    layout.tsx                  全站布局 + 统计脚本注入
  components/
    AdSlot.tsx                  ★ 可插拔广告位
    Analytics.tsx               ★ gtag(GA4+Ads) + AdSense 主脚本
    BookCard.tsx
  lib/
    config.ts                   ★ 站名 / 广告 / 统计 全部配置入口
    db.ts / seed.ts / repo.ts   SQLite 层
```

## 接广告（上线时做）

把 `.env.example` 复制成 `.env.local`，按需填：

| 变量 | 作用 |
|---|---|
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense 客户端 `ca-pub-xxxx`，填了才加载 AdSense |
| `NEXT_PUBLIC_AD_HOME_TOP` 等 | 各广告位的 slot id（AdSense 后台建广告单元后得到） |
| `NEXT_PUBLIC_AD_TP_*` | 第三方联盟（PropellerAds/Adsterra）给的 HTML 片段，直接贴 |
| `NEXT_PUBLIC_GA_ID` | GA4 衡量 ID `G-xxxx` |
| `NEXT_PUBLIC_GADS_ID` | Google Ads 转化 ID `AW-xxxx`（投放买量用） |
| `NEXT_PUBLIC_SITE_URL` | 上线域名（sitemap/canonical 用） |

留空的项不渲染对应广告；开发环境广告位显示灰色占位框，生产环境（`NODE_ENV=production`）空位直接不渲染。

广告位组件用法：`<AdSlot place="readerTop" />`（AdSense 位）或 `<AdSlot tpKey="readerInline" />`（第三方位）。

## ⚠️ 内容合规（务必先读）

- AdSense 政策明确拒绝「采集/无附加价值内容」与「侵权内容」，**盗版采集站申请 AdSense 大概率被拒/封号**。这是 Google 审的，代码绕不过去。
- 采集小说本身有版权风险，平台方担责。
- 现实选择：要么用**自有/授权/公版**内容冲 AdSense；要么用对内容来源宽松的**第三方联盟广告**变现（本站广告位已兼容）。

## SEO（已实现）

- **每页独立 title/description**、canonical、`<html lang="zh-CN">`、每页 1 个 `<h1>`
- **结构化数据 JSON-LD**：首页 `WebSite`+站内搜索框、书页 `Book`+`BreadcrumbList`、章节页 `BreadcrumbList`（见 `src/lib/seo.ts`）
- **Open Graph**：书页 `og:type=book`、章节页 `og:type=article`
- **sitemap.xml**（含每章）+ **robots.txt**
- **搜索页 `noindex`**（避免无限组合页被收录）
- **自定义 404**（`not-found.tsx`，带分类/热门内链引导）
- **内链策略**：章节页「同类好书」、面包屑、分类互链
- **ISR 静态化**：首页/书页/章节/分类页 `export const revalidate`，提速 + 省抓取预算；浏览量改用客户端 beacon（`/api/view`）解耦缓存
- **IndexNow**：`npm run indexnow` 推送 Bing/Yandex；key 文件 `public/<key>.txt`
  - ⚠️ 上线必须设 `NEXT_PUBLIC_SITE_URL`，否则 canonical/og 指向 localhost
  - Google 不支持 IndexNow，仍需在 GSC 手动提交 sitemap（人工）

## 友链统计模块（已实现，对应 SEO 文档第 6 节）

- 后台 `/admin/links`（口令保护，默认 `admin888`，改 env `ADMIN_KEY`）：新增友链、查看来路/去路 PV·UV、每日汇总报表
- **来路**：站外链接设为 `站点/?ref=渠道值` → 前端 `RefTracker` 上报 `/api/ref`
- **去路**：站内友链指向 `站点/go?code=渠道值` → 记一次去路并 302 跳转
- **24h 同 IP 同向去重**计 UV；原始日志保留 30 天自动清理
- 表结构 `friend_links` / `friend_link_logs` 见 `src/lib/db.ts`，逻辑见 `src/lib/friends.ts`

## 待办（尚未实现，需要再开工）

- [ ] 采集脚本：把目标源小说写入 `books`/`chapters` 表（schema 见 `src/lib/db.ts`，建议放 `scripts/crawl.ts`）
- [ ] 书架 / 阅读进度（需登录体系 + 2FA）
- [ ] 友链后台接入正式鉴权（当前仅开发级口令）
- [ ] 部署（VPS / 域名 / Nginx + pm2 或 docker）
