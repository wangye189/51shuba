import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site } from "@/lib/config";
import Analytics from "@/components/Analytics";
import RefTracker from "@/components/RefTracker";
import AuthNav from "@/components/AuthNav";
import ChannelNav from "@/components/ChannelNav";
import ChannelSwitch from "@/components/ChannelSwitch";
import { getChannels, getCategories } from "@/lib/taxonomy";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} - ${site.slogan}`,
    template: `%s - ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  openGraph: {
    title: `${site.name} - ${site.slogan}`,
    description: site.description,
    type: "website",
    locale: "zh_CN",
  },
  // 站长验证：值从环境变量来，拿到验证码填进 Netlify 环境变量即可
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION || undefined,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || undefined,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [channels, categories] = await Promise.all([getChannels(), getCategories()]);
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        {/* 顶部细条 */}
        <div className="site-bar border-b border-[var(--border)] bg-white text-xs text-[var(--muted)]">
          <div className="mx-auto flex max-w-[1000px] items-center justify-between px-3 py-1.5">
            <span className="flex items-center gap-2">
              <ChannelSwitch channels={channels} />
              <span className="hidden text-gray-300 sm:inline">|</span>
              <span className="hidden sm:inline">{site.slogan}</span>
            </span>
            <span className="flex items-center gap-3">
              <AuthNav />
              <Link href="/shelf" className="hover:text-[var(--accent)]">我的书架</Link>
              <Link href="/about" className="hover:text-[var(--accent)]">关于</Link>
            </span>
          </div>
        </div>

        {/* LOGO + 搜索 */}
        <header className="bg-white">
          <div className="mx-auto flex max-w-[1000px] items-center gap-2 px-3 py-3 sm:gap-4 sm:py-4">
            <Link href="/" className="flex shrink-0 items-baseline gap-2">
              <span className="text-2xl font-extrabold text-[var(--accent)] sm:text-3xl">
                {site.name}
              </span>
              <span className="hidden text-xs text-[var(--muted)] sm:inline">{site.domainText}</span>
            </Link>
            <form action="/search" className="ml-auto flex min-w-0 flex-1 justify-end sm:flex-none">
              <input
                name="q"
                placeholder="搜索书名、作者"
                className="h-8 w-full min-w-0 max-w-[220px] rounded-l border border-[var(--border)] px-3 text-[13px] outline-none focus:border-[var(--accent)] sm:w-56"
              />
              <button
                type="submit"
                className="h-8 shrink-0 rounded-r bg-[var(--accent)] px-3 text-[13px] text-white hover:opacity-90 sm:px-4"
              >
                搜索
              </button>
            </form>
          </div>
        </header>

        {/* 深色分类导航条（男生/女生频道）*/}
        <ChannelNav channels={channels} categories={categories} />

        <main className="mx-auto w-full max-w-[1000px] flex-1 px-3 py-4">
          {children}
        </main>

        <footer className="mt-4 border-t border-[var(--border)] bg-white py-5 text-center text-xs text-[var(--muted)]">
          <div className="mx-auto max-w-[1000px] space-y-1 px-3">
            <p className="space-x-3">
              <Link href="/about" className="hover:text-[var(--accent)]">关于我们</Link>
              <Link href="/about#contact" className="hover:text-[var(--accent)]">联系方式</Link>
              <Link href="/about#disclaimer" className="hover:text-[var(--accent)]">免责声明</Link>
              <Link href="/sitemap.xml" className="hover:text-[var(--accent)]">网站地图</Link>
            </p>
            <p>© 2026 {site.name} · {site.slogan}</p>
            <p>本站收录内容均来自网络，版权归原作者所有；如有侵权请联系我们删除。</p>
          </div>
        </footer>

        <Analytics />
        <RefTracker />
      </body>
    </html>
  );
}
