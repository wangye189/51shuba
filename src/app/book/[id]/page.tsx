import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, listChapters, hotRanking } from "@/lib/repo";
import { categoryName, site } from "@/lib/config";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import { bookJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 600; // ISR 静态化

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(Number(id));
  if (!book) return { title: "未找到" };
  const desc = `${book.title} 全文免费阅读。${book.intro}`.slice(0, 150);
  const url = `${site.url}/book/${book.id}`;
  return {
    title: `${book.title} - ${book.author}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${book.title} - ${book.author}`,
      description: desc,
      url,
      type: "book",
      locale: "zh_CN",
    },
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const book = await getBook(Number(id));
  if (!book) notFound();

  const [chapters, hot] = await Promise.all([listChapters(book.id), hotRanking(10)]);

  return (
    <div className="space-y-3">
      <JsonLd
        data={[
          bookJsonLd(book, chapters.length),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: categoryName(book.category), path: `/category/${book.category}` },
            { name: book.title, path: `/book/${book.id}` },
          ]),
        ]}
      />
      {/* 面包屑 */}
      <nav className="px-1 text-[12px] text-[var(--muted)]">
        <Link href="/" className="link">首页</Link> &gt;{" "}
        <Link href={`/category/${book.category}`} className="link">
          {categoryName(book.category)}
        </Link>{" "}
        &gt; {book.title}
      </nav>

      <AdSlot place="homeTop" />

      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          {/* 书籍信息 */}
          <section className="panel p-4">
            <div className="flex gap-4">
              <div className="grid h-44 w-32 shrink-0 place-items-center rounded bg-gradient-to-br from-[#c0392b] to-[#7b1010] px-2 text-center text-lg font-bold text-white">
                {book.title}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-[#222]">{book.title}</h1>
                <div className="mt-2 space-y-1 text-[13px] text-[#666]">
                  <p>作者：{book.author}</p>
                  <p>分类：{categoryName(book.category)} · {book.status}</p>
                  <p>字数：约 {book.words} 字 · 点击：{(book.views / 10000).toFixed(1)}万</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {chapters.length > 0 && (
                    <>
                      <Link
                        href={`/book/${book.id}/1`}
                        className="rounded bg-[var(--accent)] px-5 py-2 text-[13px] text-white hover:opacity-90"
                      >
                        开始阅读
                      </Link>
                      <Link
                        href={`/book/${book.id}/${chapters.length}`}
                        className="rounded border border-[var(--border)] px-5 py-2 text-[13px] text-[#555] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        最新章节
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 border-t border-dashed border-[#eee] pt-3">
              <h2 className="mb-1 text-[14px] font-bold text-[#333]">内容简介</h2>
              <p className="text-[13px] leading-relaxed text-[#666]">{book.intro}</p>
            </div>
          </section>

          {/* 章节目录 */}
          <section className="panel">
            <div className="block-head">
              <h2>章节目录</h2>
              <span className="more">共 {chapters.length} 章</span>
            </div>
            {chapters.length === 0 ? (
              <p className="p-6 text-center text-[13px] text-[var(--muted)]">暂无章节。</p>
            ) : (
              <ul className="grid grid-cols-1 gap-x-4 p-3 sm:grid-cols-2">
                {chapters.map((c) => (
                  <li key={c.idx} className="border-b border-dashed border-[#f0f0f0]">
                    <Link
                      href={`/book/${book.id}/${c.idx}`}
                      className="block truncate py-2 text-[13px] text-[#555] hover:text-[var(--accent)]"
                    >
                      {c.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 侧边榜单 */}
        <aside className="space-y-3">
          <AdSlot place="bookDetail" />
          <section className="panel">
            <div className="block-head"><h2>点击排行</h2></div>
            <ol className="p-3">
              {hot.map((b, i) => (
                <li key={b.id} className="flex items-center gap-2 py-1.5 text-[13px]">
                  <span className={`rank-no ${i < 3 ? "top" : ""}`}>{i + 1}</span>
                  <Link href={`/book/${b.id}`} className="link flex-1 truncate">
                    {b.title}
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
