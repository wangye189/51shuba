import { NextResponse } from "next/server";
import { incView } from "@/lib/repo";

// 浏览量计数：客户端 beacon 调用，Node 运行时写 SQLite。
// 与 ISR 静态化解耦——页面被缓存仍能统计真实浏览。
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const bookId = Number(id);
    if (Number.isInteger(bookId) && bookId > 0) await incView(bookId);
  } catch {
    // 忽略坏请求
  }
  return NextResponse.json({ ok: true });
}
