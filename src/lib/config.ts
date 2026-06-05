// 站点 & 广告 全局配置 —— 改这里即可，不碰业务代码
export const site = {
  name: "51书库", // 站名：想叫「51书吧」改这一行即可
  shortName: "51书库",
  domainText: "51shuku.com", // LOGO 旁的域名小字
  slogan: "海量小说 · 免费畅读",
  description: "51书库 - 免费在线阅读海量小说，玄幻、都市、言情、历史一网打尽，全本无弹窗。",
  // 上线后改成真实域名（sitemap / canonical / og 用）
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  keywords: ["小说", "免费阅读", "在线小说", "全本小说", "玄幻", "都市", "言情"],
};

// ===== 广告配置：做成可插拔，AdSense / 第三方联盟都能塞 =====
// 任何一项留空 = 该位置不渲染广告（开发期默认全空，不影响调试）
export const ads = {
  // Google AdSense 客户端 ID，形如 ca-pub-xxxxxxxxxxxxxxxx
  adsenseClient: process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "",
  // 各广告位的 slot id（在 AdSense 后台创建广告单元后填入）
  slots: {
    homeTop: process.env.NEXT_PUBLIC_AD_HOME_TOP || "",
    bookDetail: process.env.NEXT_PUBLIC_AD_BOOK_DETAIL || "",
    readerTop: process.env.NEXT_PUBLIC_AD_READER_TOP || "",
    readerBottom: process.env.NEXT_PUBLIC_AD_READER_BOTTOM || "",
  },
  // 第三方联盟广告（PropellerAds/Adsterra 等）：直接贴它们给的 HTML/JS 片段
  // key 与 <AdSlot place="..."> 对应；留空则不渲染
  thirdParty: {
    readerInline: process.env.NEXT_PUBLIC_AD_TP_READER_INLINE || "",
  } as Record<string, string>,
};

// ===== 统计 & Google Ads 转化跟踪 =====
export const analytics = {
  // Google Analytics 4 衡量 ID：G-XXXXXXXXXX
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",
  // Google Ads 转化 ID：AW-XXXXXXXXX（投放买量时用）
  adsId: process.env.NEXT_PUBLIC_GADS_ID || "",
};

// 频道/分类已改为数据库驱动（见 lib/taxonomy.ts）。
// 频道 key 现为动态字符串。
export type Channel = string;

// 从采集来源拼 69shuba 的封面图 URL
// CDN 规律：image/{floor(id/1000)}/{id}/{id}s.jpg
// 注意：必须用 floor(id/1000)，不能用 id.slice(0,2)——后者只在 5 位 id 时碰巧相等，
// 3/4/6 位 id 会算错目录导致 404（例：id=105 应为 /0/105/，slice 会拼成 /10/105/）
export function coverUrl(source?: string, cover?: string): string | null {
  if (cover) return cover;
  const m = (source || "").match(/^69shuba:(\d+)$/);
  if (!m) return null;
  const id = m[1];
  const dir = Math.floor(Number(id) / 1000);
  return `https://cdn.cdnshu.com/files/article/image/${dir}/${id}/${id}s.jpg`;
}
