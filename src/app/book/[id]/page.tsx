import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, listChapters, hotRanking, allBookIds } from "@/lib/repo";
import { coverUrl, site } from "@/lib/config";
import { categoryNameOf } from "@/lib/taxonomy";
import AdSlot from "@/components/AdSlot";
import Cover from "@/components/Cover";
import JsonLd from "@/components/JsonLd";
import { bookJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400;

export async function generateStaticParams() {
  const books = await allBookIds();
  return books.map((b) => ({ id: String(b.id) }));
}

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
    openGraph: { title: `${book.title} - ${book.author}`, description: desc, url, type: "book", locale: "zh_CN" },
  };
}

export default async function BookPage({ params }: Props) {
  const { id } = await params;
  const book = await getBook(Number(id));
  if (!book) notFound();

  const [chapters, hot] = await Promise.all([listChapters(book.id), hotRanking(10)]);
  const catName = await categoryNameOf(book.category);
  const firstIdx = chapters[0]?.idx;
  const lastIdx = chapters[chapters.length - 1]?.idx;

  return (
    <div className="space-y-3">
      <JsonLd data={[
        bookJsonLd(book, chapters.length, catName),
        breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: catName, path: `/category/${book.category}` },
          { name: book.title, path: `/book/${book.id}` },
        ]),
      ]} />
      <nav className="px-1 text-[12px] text-[var(--muted)]">
        <Link href="/" className="link">首页</Link> &gt;{" "}
        <Link href={`/category/${book.category}`} className="link">{catName}</Link> &gt; {book.title}
      </nav>

      {/* 书籍信息卡 */}
      <section className="panel p-4">
        <div className="flex gap-4">
          <Cover src={coverUrl(book.source, book.cover)} title={book.title} className="h-40 w-[7.5rem] shrink-0 rounded-lg shadow" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-[#222]">{book.title}</h1>
            <div className="mt-2 space-y-1 text-[13px] text-[#666]">
              <p>{book.author}</p>
              <p>{catName} · {book.status} · {chapters.length} 章</p>
              <p>{(book.views / 10000).toFixed(1)}万点击</p>
            </div>
            {chapters.length > 0 && (
              <div className="mt-3 flex gap-2">
                <Link href={`/book/${book.id}/${firstIdx}`} className="flex-1 rounded-lg bg-[var(--accent)] py-2.5 text-center text-[14px] font-medium text-white active:opacity-80">开始阅读</Link>
                <Link href={`/book/${book.id}/${lastIdx}`} className="flex-1 rounded-lg border border-[var(--border)] py-2.5 text-center text-[14px] text-[#555] active:border-[var(--accent)]">读最新</Link>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 border-t border-dashed border-[#eee] pt-3">
          <h2 className="mb-1 text-[14px] font-bold text-[#333]">内容简介</h2>
          <p className="text-[13px] leading-relaxed text-[#666]">{book.intro || "暂无简介。"}</p>
        </div>
      </section>

      <AdSlot place="bookDetail" />

      {/* 章节目录（大点击区，手机好点）*/}
      <section className="panel">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2.5">
          <h2 className="border-l-4 border-[var(--accent)] pl-2 text-[15px] font-bold">章节目录</h2>
          <span className="text-[12px] text-[var(--muted)]">共 {chapters.length} 章</span>
        </div>
        {chapters.length === 0 ? (
          <p className="p-6 text-center text-[13px] text-[var(--muted)]">暂无章节。</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2">
            {chapters.map((c) => (
              <li key={c.idx} className="border-b border-dashed border-[#f0f0f0]">
                <Link href={`/book/${book.id}/${c.idx}`}
                  className="flex min-h-[46px] items-center truncate px-3 py-3 text-[14px] text-[#444] active:bg-[#fcf7f7] active:text-[var(--accent)]">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
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
                  <p className="truncate text-[12px] text-[var(--muted)]">{b.author}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
