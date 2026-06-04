import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { listBooks } from "@/lib/repo";
import { latestUpdated } from "@/lib/repo";
import { categories, categoryName, site } from "@/lib/config";
import BookListRow from "@/components/BookListRow";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 600; // ISR

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = categoryName(slug);
  return {
    title: `${name}小说大全`,
    description: `${name}小说大全，免费在线阅读全本${name}小说，无弹窗、更新快。`,
    alternates: { canonical: `${site.url}/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  if (!categories.some((c) => c.slug === slug)) notFound();

  const [books, allRows] = await Promise.all([
    listBooks({ category: slug, limit: 100 }),
    latestUpdated(200),
  ]);
  // 复用最新更新查询拿到带封面/最新章节的行
  const rows = allRows.filter((b) => b.category === slug);

  return (
    <div className="space-y-3">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: `${categoryName(slug)}小说`, path: `/category/${slug}` },
        ])}
      />
      <AdSlot place="homeTop" />
      <section className="panel">
        <div className="block-head">
          <h2>{categoryName(slug)}小说</h2>
          <span className="more">共 {books.length} 部</span>
        </div>
        {rows.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-[var(--muted)]">
            该分类暂无书籍。
          </p>
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
