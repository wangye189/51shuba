import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin";
import { deleteUser } from "@/lib/repo";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "未授权" }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  await deleteUser(Number(id));
  return NextResponse.json({ ok: true });
}
