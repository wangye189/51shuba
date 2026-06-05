import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { createCategory, updateCategory, deleteCategory } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { slug, name, channel, sort } = await req.json().catch(() => ({}));
  if (!slug || !name || !channel) return NextResponse.json({ error: "slug/名称/频道必填" }, { status: 400 });
  try {
    await createCategory(String(slug).trim(), String(name).trim(), String(channel), Number(sort) || 0);
  } catch {
    return NextResponse.json({ error: "slug 可能已存在" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id, name, channel, sort } = await req.json().catch(() => ({}));
  if (!id || !name || !channel) return NextResponse.json({ error: "参数不全" }, { status: 400 });
  await updateCategory(Number(id), String(name).trim(), String(channel), Number(sort) || 0);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  await deleteCategory(Number(id));
  return NextResponse.json({ ok: true });
}
