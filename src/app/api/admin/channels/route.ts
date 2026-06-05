import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { createChannel, updateChannel, deleteChannel } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { ckey, name, sort } = await req.json().catch(() => ({}));
  if (!ckey || !name) return NextResponse.json({ error: "标识/名称必填" }, { status: 400 });
  if (!/^[a-z0-9]+$/.test(String(ckey))) return NextResponse.json({ error: "标识只能用小写字母或数字" }, { status: 400 });
  try {
    await createChannel(String(ckey).trim(), String(name).trim(), Number(sort) || 0);
  } catch {
    return NextResponse.json({ error: "标识可能已存在" }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function PUT(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { ckey, name, sort } = await req.json().catch(() => ({}));
  if (!ckey || !name) return NextResponse.json({ error: "参数不全" }, { status: 400 });
  await updateChannel(String(ckey), String(name).trim(), Number(sort) || 0);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { ckey } = await req.json().catch(() => ({}));
  if (!ckey) return NextResponse.json({ error: "缺少标识" }, { status: 400 });
  if (ckey === "boy") return NextResponse.json({ error: "男生频道（根频道）不可删除" }, { status: 400 });
  await deleteChannel(String(ckey));
  return NextResponse.json({ ok: true });
}
