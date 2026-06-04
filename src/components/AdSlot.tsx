import { ads } from "@/lib/config";

type Place = keyof typeof ads.slots;

/**
 * 可插拔广告位。三种渲染：
 *  1) 配了 AdSense client + 该位置 slot → 渲染 AdSense 单元
 *  2) 配了第三方联盟 HTML 片段（tpKey）→ 注入第三方广告
 *  3) 都没配 → 渲染占位框（开发期可见，方便排版；生产可隐藏）
 */
export default function AdSlot({
  place,
  tpKey,
  className = "",
}: {
  place?: Place;
  tpKey?: string;
  className?: string;
}) {
  const slotId = place ? ads.slots[place] : "";
  const tpHtml = tpKey ? ads.thirdParty[tpKey] : "";

  // 1) AdSense
  if (ads.adsenseClient && slotId) {
    return (
      <div className={`ad-slot ${className}`}>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={ads.adsenseClient}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: "(adsbygoogle = window.adsbygoogle || []).push({});",
          }}
        />
      </div>
    );
  }

  // 2) 第三方联盟广告
  if (tpHtml) {
    return (
      <div
        className={`ad-slot ${className}`}
        dangerouslySetInnerHTML={{ __html: tpHtml }}
      />
    );
  }

  // 3) 占位（仅非生产环境显示，避免空白；生产环境直接不渲染）
  if (process.env.NODE_ENV !== "production") {
    return (
      <div
        className={`ad-slot flex items-center justify-center rounded-md border border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/40 ${className}`}
        style={{ minHeight: 90 }}
      >
        广告位 {place || tpKey || "?"}（未配置 · 上线填 ID 即显示）
      </div>
    );
  }
  return null;
}
