import Script from "next/script";
import { ads, analytics } from "@/lib/config";

/**
 * 统一注入第三方脚本：
 *  - Google Analytics 4（站点流量统计）
 *  - Google Ads（投放买量时的转化跟踪 gtag）
 *  - AdSense 主脚本（页面广告变现）
 * 任何 ID 没配则不注入，开发期保持干净。
 */
export default function Analytics() {
  const gtagId = analytics.gaId || analytics.adsId;
  return (
    <>
      {/* gtag.js：GA4 + Google Ads 共用 */}
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${analytics.gaId ? `gtag('config', '${analytics.gaId}');` : ""}
              ${analytics.adsId ? `gtag('config', '${analytics.adsId}');` : ""}
            `}
          </Script>
        </>
      )}

      {/* AdSense 主脚本 */}
      {ads.adsenseClient && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.adsenseClient}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
    </>
  );
}
