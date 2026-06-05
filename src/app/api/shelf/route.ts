import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserShelf, addToShelf, removeFromShelf } from "@/lib/repo";
import { coverUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const books = await getUserShelf(user.id);
  return NextResponse.json({
    books: books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.author,
      cover: coverUrl(b.source, b.cover),
      last_idx: b.last_idx,
      last_title: b.last_title,
    })),
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { bookId } = await req.json().catch(() => ({}));
  if (!bookId) return NextResponse.json({ error: "缺少 bookId" }, { status: 400 });
  await addToShelf(user.id, Number(bookId));
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  const { bookId } = await req.json().catch(() => ({}));
  if (!bookId) return NextResponse.json({ error: "缺少 bookId" }, { status: 400 });
  await removeFromShelf(user.id, Number(bookId));
  return NextResponse.json({ ok: true });
}
