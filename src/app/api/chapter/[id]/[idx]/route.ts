import { getChapter, listChapters } from "@/lib/repo";

// 章节内容接口：运行时按需生成（不在 build 时预生成几千个 JSON），供阅读器续载下一章
export const dynamic = "force-dynamic";

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
