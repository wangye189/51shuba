import Link from "next/link";
import type { Metadata } from "next";
import { hotRanking } from "@/lib/repo";
import { categoryName } from "@/lib/config";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "点击排行榜" };

export default async function RankPage() {
  const list = await hotRanking(50);
  return (
    <div className="space-y-3">
      <AdSlot place="homeTop" />
      <section className="panel">
        <div className="block-head">
          <h2>点击排行榜</h2>
          <span className="more">按总点击量排序</span>
        </div>
        <ol>
          {list.map((b, i) => (
            <li
              key={b.id}
              className="flex items-center gap-3 border-b border-dashed border-[#eee] px-3 py-2.5 text-[14px] last:border-0 hover:bg-[#fcf7f7]"
            >
              <span className={`rank-no ${i < 3 ? "top" : ""}`}>{i + 1}</span>
              <Link href={`/book/${b.id}`} className="link w-40 truncate font-medium">
                {b.title}
              </Link>
              <span className="w-16 text-[12px] text-[var(--muted)]">{b.author}</span>
              <Link
                href={`/category/${b.category}`}
                className="w-14 text-[12px] text-[var(--link)] hover:text-[var(--accent)]"
              >
                [{categoryName(b.category)}]
              </Link>
              <span className="flex-1 truncate text-[12px] text-[#777]">
                {b.last_title || "—"}
              </span>
              <span className="text-[12px] text-[var(--accent)]">
                {(b.views / 10000).toFixed(1)}万
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
