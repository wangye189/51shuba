import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getChapter, listChapters, allChapterParams } from "@/lib/repo";
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

  // 按「实际存在的章节列表」算上/下章，避免残缺章节导致点下一章 404
  const chapters = await listChapters(bookId);
  const pos = chapters.findIndex((c) => c.idx === idx);
  const total = chapters.length;
  const prevIdx = pos > 0 ? chapters[pos - 1].idx : null;
  const nextIdx = pos >= 0 && pos < total - 1 ? chapters[pos + 1].idx : null;
  const curNo = pos >= 0 ? pos + 1 : idx; // 第几章（连续显示）

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
        idx={curNo}
        total={total}
        content={chap.content}
        prevHref={prevIdx ? `/book/${bookId}/${prevIdx}` : null}
        nextHref={nextIdx ? `/book/${bookId}/${nextIdx}` : null}
        catalogHref={`/book/${bookId}`}
      />
    </>
  );
}
