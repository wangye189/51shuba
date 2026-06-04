import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getChapter, chapterCount, allChapterParams } from "@/lib/repo";
import { categoryName, site } from "@/lib/config";
import JsonLd from "@/components/JsonLd";
import ViewBeacon from "@/components/ViewBeacon";
import ReaderShell from "@/components/ReaderShell";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400; // 构建时预渲染为静态 + 每天再生

// 构建时把所有章节预渲染成静态 HTML（CDN 秒开，不再每次查库）
export async function generateStaticParams() {
  const rows = await allChapterParams();
  return rows.map((r) => ({ id: String(r.book_id), chapter: String(r.idx) }));
}

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
    openGraph: { title: `${chap.title} - ${book.title}`, description: desc, url, type: "article", locale: "zh_CN" },
  };
}

export default async function ChapterPage({ params }: Props) {
  const { id, chapter } = await params;
  const bookId = Number(id);
  const idx = Number(chapter);
  const book = await getBook(bookId);
  const chap = book ? await getChapter(bookId, idx) : undefined;
  if (!book || !chap) notFound();

  const total = await chapterCount(bookId);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: categoryName(book.category), path: `/category/${book.category}` },
          { name: book.title, path: `/book/${book.id}` },
          { name: chap.title, path: `/book/${book.id}/${chap.idx}` },
        ])}
      />
      <ViewBeacon bookId={bookId} />
      <ReaderShell
        bookId={bookId}
        bookTitle={book.title}
        chapterTitle={chap.title}
        idx={idx}
        total={total}
        content={chap.content}
        prevHref={idx > 1 ? `/book/${bookId}/${idx - 1}` : null}
        nextHref={idx < total ? `/book/${bookId}/${idx + 1}` : null}
        catalogHref={`/book/${bookId}`}
      />
    </>
  );
}
