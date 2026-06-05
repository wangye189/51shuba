import { getChapter, listChapters, allChapterParams } from "@/lib/repo";

// 章节内容接口：构建时全部预生成为静态 JSON（CDN 秒回，不查库），供阅读器无缝续载下一章
export const dynamic = "force-static";

export async function generateStaticParams() {
  const rows = await allChapterParams();
  return rows.map((r) => ({ id: String(r.book_id), idx: String(r.idx) }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; idx: string }> }) {
  const { id, idx } = await ctx.params;
  const bookId = Number(id);
  const i = Number(idx);
  const chap = await getChapter(bookId, i);
  if (!chap) return Response.json(null, { status: 404 });
  const chapters = await listChapters(bookId);
  const pos = chapters.findIndex((c) => c.idx === i);
  const nextIdx = pos >= 0 && pos < chapters.length - 1 ? chapters[pos + 1].idx : null;
  return Response.json({
    idx: i,
    no: pos >= 0 ? pos + 1 : i,
    total: chapters.length,
    title: chap.title,
    content: chap.content,
    nextIdx,
  });
}
