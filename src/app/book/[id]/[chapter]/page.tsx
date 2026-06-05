import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBook, getChapter, listChapters } from "@/lib/repo";
import { site } from "@/lib/config";
import { categoryNameOf, categoryChannelOf } from "@/lib/taxonomy";
import JsonLd from "@/components/JsonLd";
import ViewBeacon from "@/components/ViewBeacon";
import ReaderShell from "@/components/ReaderShell";
import { breadcrumbJsonLd } from "@/lib/seo";

export const revalidate = 86400; // 构建时预渲染为静态 + 每天再生

// 构建时把所有章节预渲染成静态 HTML（CDN 秒开，不再每次查库）
export async function generateStaticParams() {
  // 不预生成全部章节页（几千页会拖垮连云库的 build）；运行时按需渲染 + revalidate 缓存
  return [];
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
  const catName = await categoryNameOf(book.category);
  const catChannel = await categoryChannelOf(book.category);
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
          { name: catName, path: `/category/${book.category}` },
          { name: book.title, path: `/book/${book.id}` },
          { name: chap.title, path: `/book/${book.id}/${chap.idx}` },
        ])}
      />
      <ViewBeacon bookId={bookId} />
      <ReaderShell
        bookId={bookId}
        bookTitle={book.title}
        total={total}
        prevHref={prevIdx ? `/book/${bookId}/${prevIdx}` : null}
        catalogHref={`/book/${bookId}`}
        initial={{ idx, no: curNo, title: chap.title, content: chap.content, nextIdx }}
        channel={catChannel}
      />
    </>
  );
}
