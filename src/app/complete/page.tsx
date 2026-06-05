import type { Metadata } from "next";
import { latestUpdated } from "@/lib/repo";
import BookListRow from "@/components/BookListRow";
import AdSlot from "@/components/AdSlot";
import { site } from "@/lib/config";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "完本小说",
  description: "已完结全本小说大全，免费在线阅读，无弹窗、更新快。",
  alternates: { canonical: `${site.url}/complete` },
};

export default async function CompletePage() {
  // 取较大范围再按状态筛「完本/完结」
  const rows = (await latestUpdated(500)).filter((b) => /完/.test(b.status || ""));

  return (
    <div className="space-y-3">
      <AdSlot place="homeTop" />
      <section className="panel">
        <div className="block-head">
          <h2>完本小说</h2>
          <span className="more">共 {rows.length} 部</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">暂无完本作品。</p>
        ) : (
          <div>
            {rows.map((b) => (
              <BookListRow key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
