import Link from "next/link";
import { latestUpdated, hotRanking, featured } from "@/lib/repo";
import { channelCategories, categoryName, coverUrl, site, type Channel } from "@/lib/config";
import AdSlot from "@/components/AdSlot";
import Cover from "@/components/Cover";

export default async function ChannelHome({ channel }: { channel: Channel }) {
  const [feat, latest, hot] = await Promise.all([
    featured(8, channel),
    latestUpdated(12, channel),
    hotRanking(10, channel),
  ]);
  const cats = channelCategories(channel);

  return (
    <div className="space-y-4">
      <AdSlot place="homeTop" />

      {/* 分类快捷（当前频道）*/}
      <section className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-[13px] active:bg-[var(--accent)] active:text-white">
            {c.name}
          </Link>
        ))}
      </section>

      {/* 精品推荐 */}
      <section className="panel p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="border-l-4 border-[var(--accent)] pl-2 text-[15px] font-bold">精品推荐</h2>
          <Link href="/rank" className="text-[12px] text-[var(--muted)]">更多 ›</Link>
        </div>
        {feat.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--muted)]">该频道暂无书籍。</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {feat.map((b) => (
              <Link key={b.id} href={`/book/${b.id}`} className="group block">
                <Cover src={coverUrl(b.source, b.cover)} title={b.title} className="aspect-[3/4] w-full rounded-md shadow-sm" />
                <p className="mt-1 truncate text-center text-[12px] group-active:text-[var(--accent)]">{b.title}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 最新更新 */}
      <section className="panel">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <h2 className="border-l-4 border-[var(--accent)] pl-2 text-[15px] font-bold">最新更新</h2>
          <span className="text-[12px] text-[var(--muted)]">共 {latest.length} 部</span>
        </div>
        <ul>
          {latest.map((b) => (
            <li key={b.id} className="border-b border-dashed border-[#eee] last:border-0">
              <Link href={`/book/${b.id}`} className="flex gap-3 p-3 active:bg-[#fcf7f7]">
                <Cover src={coverUrl(b.source, b.cover)} title={b.title} className="h-20 w-[3.75rem] shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-medium text-[#222]">{b.title}</span>
                    <span className="shrink-0 text-[11px] text-[var(--muted)]">[{categoryName(b.category)}]</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-[var(--muted)]">{b.author} · {b.status}</p>
                  <p className="mt-1 truncate text-[12px] text-[#666]">最新：{b.last_title || "—"}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 点击排行 */}
      <section className="panel">
        <div className="border-b border-[var(--border)] px-3 py-2.5">
          <h2 className="border-l-4 border-[var(--accent)] pl-2 text-[15px] font-bold">点击排行</h2>
        </div>
        <ol className="p-2">
          {hot.map((b, i) => (
            <li key={b.id}>
              <Link href={`/book/${b.id}`} className="flex items-center gap-3 rounded-lg p-2 active:bg-[#fcf7f7]">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded text-[13px] font-bold ${i < 3 ? "bg-[var(--accent)] text-white" : "bg-[#eee] text-[#888]"}`}>{i + 1}</span>
                <Cover src={coverUrl(b.source, b.cover)} title={b.title} className="h-14 w-11 shrink-0 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium">{b.title}</p>
                  <p className="truncate text-[12px] text-[var(--muted)]">{b.author} · {categoryName(b.category)}</p>
                </div>
                <span className="shrink-0 text-[12px] text-[var(--accent)]">{(b.views / 10000).toFixed(1)}万</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <p className="px-1 text-[12px] leading-relaxed text-[var(--muted)]">{site.description}</p>
    </div>
  );
}
