import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { site, categories } from "@/lib/config";
import Analytics from "@/components/Analytics";
import RefTracker from "@/components/RefTracker";

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        {/* 顶部细条 */}
        <div className="border-b border-[var(--border)] bg-white text-xs text-[var(--muted)]">
          <div className="mx-auto flex max-w-[1000px] items-center justify-between px-3 py-1.5">
            <span>{site.slogan}</span>
            <span className="flex gap-3">
              <Link href="/" className="hover:text-[var(--accent)]">加入书签</Link>
              <Link href="/" className="hover:text-[var(--accent)]">手机版</Link>
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

        {/* 深色分类导航条 */}
        <nav className="bg-[var(--nav-bg)] text-white">
          <div className="mx-auto flex max-w-[1000px] flex-wrap items-center px-2 text-sm">
            <Link href="/" className="px-4 py-2.5 font-bold hover:bg-black/30">
              首页
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="px-4 py-2.5 hover:bg-black/30"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/rank" className="px-4 py-2.5 hover:bg-black/30">
              排行榜
            </Link>
            <Link href="/?status=完本" className="px-4 py-2.5 hover:bg-black/30">
              完本
            </Link>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-[1000px] flex-1 px-3 py-4">
          {children}
        </main>

        <footer className="mt-4 border-t border-[var(--border)] bg-white py-5 text-center text-xs text-[var(--muted)]">
          <div className="mx-auto max-w-[1000px] space-y-1 px-3">
            <p className="space-x-3">
              <Link href="/" className="hover:text-[var(--accent)]">关于我们</Link>
              <Link href="/" className="hover:text-[var(--accent)]">联系方式</Link>
              <Link href="/" className="hover:text-[var(--accent)]">免责声明</Link>
              <Link href="/sitemap.xml" className="hover:text-[var(--accent)]">网站地图</Link>
            </p>
            <p>© 2026 {site.name} · {site.slogan}</p>
            <p>本站为技术演示，演示内容均为版权过期之公版古籍。</p>
          </div>
        </footer>

        <Analytics />
        <RefTracker />
      </body>
    </html>
  );
}
