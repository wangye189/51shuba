import { NextResponse } from "next/server";
import { getUserByUsername } from "@/lib/repo";
import { verifyPassword, signToken, AUTH_COOKIE, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  const user = await getUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.password)))
    return NextResponse.json({ error: "账号或密码错误" }, { status: 401 });

  const token = await signToken({ id: user.id, username: user.username });
  const res = NextResponse.json({ user: { id: user.id, username: user.username } });
  res.cookies.set(AUTH_COOKIE, token, cookieOptions);
  return res;
}
