import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getChapter, chapterCount, relatedBooks } from "@/lib/repo";
import { categoryName, site } from "@/lib/config";
import AdSlot from "@/components/AdSlot";
import JsonLd from "@/components/JsonLd";
import ViewBeacon from "@/components/ViewBeacon";
import ReaderSettings from "@/components/ReaderSettings";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 3600; // ISR：章节内容稳定，缓存 1 小时，提速 + 省抓取预算

type Props = { params: Promise<{ id: string; chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, chapter } = await params;
  const book = await getBook(Number(id));
  const chap = book ? await getChapter(book.id, Number(chapter)) : undefined;
  if (!book || !chap) return { title: "未找到" };
  const url = `${site.url}/book/${book.id}/${chap.idx}`;
  const desc = `${book.title} ${chap.title}，免费在线阅读，无弹窗。`;
  return {
    title: `${chap.title} - ${book.title}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: `${chap.title} - ${book.title}`,
      description: desc,
      url,
      type: "article",
      locale: "zh_CN",
    },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { id, chapter } = await params;
  const bookId = Number(id);
  const idx = Number(chapter);
  const book = await getBook(bookId);
  const chap = book ? await getChapter(bookId, idx) : undefined;
  if (!book || !chap) notFound();

  const [total, related] = await Promise.all([chapterCount(bookId), relatedBooks(book.category, bookId, 8)]);
  const hasPrev = idx > 1;
  const hasNext = idx < total;

  const btn =
    "rounded border border-[var(--border)] px-5 py-2 text-[13px] text-[#555] hover:border-[var(--accent)] hover:text-[var(--accent)]";
  const btnOff =
    "rounded border border-[#eee] px-5 py-2 text-[13px] text-[#ccc] cursor-not-allowed";

  const Nav = () => (
    <div className="flex items-center justify-center gap-3">
      {hasPrev ? (
        <Link href={`/book/${bookId}/${idx - 1}`} className={btn}>上一章</Link>
      ) : (
        <span className={btnOff}>上一章</span>
      )}
      <Link href={`/book/${bookId}`} className={btn}>章节目录</Link>
      {hasNext ? (
        <Link href={`/book/${bookId}/${idx + 1}`} className={btn}>下一章</Link>
      ) : (
        <span className={btnOff}>下一章</span>
      )}
    </div>
  );

  return (
    <div className="space-y-3">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: categoryName(book.category), path: `/category/${book.category}` },
          { name: book.title, path: `/book/${book.id}` },
          { name: chap.title, path: `/book/${book.id}/${chap.idx}` },
        ])}
      />
      <ViewBeacon bookId={bookId} />
      {/* 面包屑 */}
      <nav className="px-1 text-[12px] text-[var(--muted)]">
        <Link href="/" className="link">首页</Link> &gt;{" "}
        <Link href={`/category/${book.category}`} className="link">
          {categoryName(book.category)}
        </Link>{" "}
        &gt;{" "}
        <Link href={`/book/${bookId}`} className="link">{book.title}</Link> &gt; {chap.title}
      </nav>

      {/* 阅读设置（字号/行距/主题）*/}
      <ReaderSettings />

      <article id="reader" data-theme="day" className="panel px-4 py-6 sm:px-10">
        <header className="mb-5 text-center">
          <h1 className="text-xl font-bold">{chap.title}</h1>
          <p className="mt-1 text-[12px] opacity-60">
            <Link href={`/book/${bookId}`} className="link">{book.title}</Link>
            {" · "}第 {idx}/{total} 章
          </p>
        </header>

        <AdSlot place="readerTop" className="mb-5" />
        <Nav />

        {/* 正文 */}
        <div className="reader-body mx-auto mt-6 max-w-2xl space-y-5">
          {chap.content.split("\n\n").map((p, i) => (
            <p key={i} className="indent-8">{p}</p>
          ))}
        </div>

        <AdSlot place="readerBottom" className="my-6" />
        <AdSlot tpKey="readerInline" className="mb-6" />
        <Nav />
      </article>

      {/* 同类好书：内链（栏目内长尾互链，降跳出）*/}
      {related.length > 0 && (
        <section className="panel">
          <div className="block-head"><h2>同类好书</h2></div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 p-3">
            {related.map((b) => (
              <Link key={b.id} href={`/book/${b.id}`} className="link text-[13px]">
                {b.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
