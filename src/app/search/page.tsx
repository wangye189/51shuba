import type { Metadata } from "next";
import { searchBooks } from "@/lib/repo";
import BookListRow from "@/components/BookListRow";
import AdSlot from "@/components/AdSlot";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `搜索「${q}」` : "搜索",
    // 搜索结果是无限组合页，禁止索引（文档技术SEO要求）
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = q.trim() ? await searchBooks(q) : [];

  return (
    <div className="space-y-3">
      <AdSlot place="homeTop" />
      <section className="panel">
        <div className="block-head">
          <h2>搜索结果</h2>
          <span className="more">
            {q.trim() ? `“${q}” 共 ${results.length} 条` : "请输入关键词"}
          </span>
        </div>
        {q.trim() && results.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-[var(--muted)]">
            没有找到「{q}」相关的书籍。
          </p>
        ) : (
          <div>
            {results.map((b) => (
              <BookListRow key={b.id} book={b} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
