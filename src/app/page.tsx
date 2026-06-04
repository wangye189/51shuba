import Link from "next/link";
import { latestUpdated, hotRanking, featured } from "@/lib/repo";
import { categories, categoryName, site } from "@/lib/config";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { websiteJsonLd } from "@/lib/seo";

export const revalidate = 300; // ISR：每 5 分钟再生，静态化提速

function Cover({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div
      className={`grid place-items-center bg-gradient-to-br from-[#c0392b] to-[#7b1010] px-1 text-center font-bold text-white ${className}`}
    >
      {title}
    </div>
  );
}

export default async function Home() {
  const [feat, latest, hot] = await Promise.all([featured(6), latestUpdated(15), hotRanking(10)]);

  return (
    <div className="space-y-3">
      <JsonLd data={websiteJsonLd()} />
      {/* 顶部广告位 */}
      <AdSlot place="homeTop" />

      {/* 精品推荐：封面卡横排 */}
      <section className="panel">
        <div className="block-head">
          <h2>精品推荐</h2>
          <Link href="/rank" className="more">更多 &gt;</Link>
        </div>
        <div className="grid grid-cols-3 gap-3 p-3 sm:grid-cols-6">
          {feat.map((b) => (
            <Link key={b.id} href={`/book/${b.id}`} className="group block">
              <Cover title={b.title} className="h-28 w-full rounded text-sm" />
              <p className="mt-1 truncate text-center text-[13px] text-[#333] group-hover:text-[var(--accent)]">
                {b.title}
              </p>
              <p className="truncate text-center text-[11px] text-[var(--muted)]">
                {b.author}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
        {/* 主体：最新更新表格 */}
        <section className="panel">
          <div className="block-head">
            <h2>最新更新</h2>
            <span className="more">全部 {latest.length} 部</span>
          </div>
          <table className="up-table table-fixed">
            <thead>
              <tr>
                <th className="hidden w-16 sm:table-cell">分类</th>
                <th className="w-[42%] sm:w-auto">书名</th>
                <th className="w-[58%] sm:w-1/3">最新章节</th>
                <th className="hidden w-20 sm:table-cell">作者</th>
                <th className="hidden w-16 sm:table-cell">状态</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((b) => (
                <tr key={b.id}>
                  <td className="hidden sm:table-cell">
                    <Link href={`/category/${b.category}`} className="link">
                      [{categoryName(b.category)}]
                    </Link>
                  </td>
                  <td className="truncate">
                    <Link href={`/book/${b.id}`} className="link font-medium whitespace-nowrap">
                      {b.title}
                    </Link>
                  </td>
                  <td className="truncate">
                    <Link
                      href={`/book/${b.id}/${b.chap_count}`}
                      className="text-[#555] hover:text-[var(--accent)]"
                    >
                      {b.last_title || "—"}
                    </Link>
                  </td>
                  <td className="hidden text-[#777] sm:table-cell">{b.author}</td>
                  <td className="hidden text-[#777] sm:table-cell">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* 侧边栏：点击榜 + 分类 + 广告 */}
        <aside className="space-y-3">
          <section className="panel">
            <div className="block-head">
              <h2>点击排行</h2>
            </div>
            <ol className="p-3">
              {hot.map((b, i) => (
                <li key={b.id} className="flex items-center gap-2 py-1.5 text-[13px]">
                  <span className={`rank-no ${i < 3 ? "top" : ""}`}>{i + 1}</span>
                  <Link href={`/book/${b.id}`} className="link flex-1 truncate">
                    {b.title}
                  </Link>
                  <span className="text-[11px] text-[var(--muted)]">
                    {(b.views / 10000).toFixed(1)}万
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel">
            <div className="block-head">
              <h2>小说分类</h2>
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded border border-[var(--border)] px-3 py-1 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>

          <AdSlot place="bookDetail" />
        </aside>
      </div>

      <p className="px-1 text-[12px] leading-relaxed text-[var(--muted)]">
        {site.description}
      </p>
    </div>
  );
}
