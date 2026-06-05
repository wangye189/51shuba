import { NextResponse } from "next/server";
import {
  getAdminByUsername,
  verifyAdminPassword,
  signAdminToken,
  ADMIN_COOKIE,
  adminCookieOptions,
} from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const admin = await getAdminByUsername(username);
  if (!admin || !(await verifyAdminPassword(password, admin.password)))
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });

  // TODO(下一步)：若 admin.totp_enabled，要求并校验 6 位动态码再放行
  const token = await signAdminToken({ id: admin.id, username: admin.username });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
