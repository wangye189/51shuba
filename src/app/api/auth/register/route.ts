import { NextResponse } from "next/server";
import { createUser, getUserByUsername } from "@/lib/repo";
import { hashPassword, signToken, AUTH_COOKIE, cookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "请求格式错误" }, { status: 400 }); }

  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (username.length < 2 || username.length > 20)
    return NextResponse.json({ error: "用户名需 2-20 个字符" }, { status: 400 });
  if (password.length < 6)
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });

  if (await getUserByUsername(username))
    return NextResponse.json({ error: "该账号已被注册，换一个吧" }, { status: 409 });

  const id = await createUser(username, await hashPassword(password));
  const token = await signToken({ id, username });
  const res = NextResponse.json({ user: { id, username } });
  res.cookies.set(AUTH_COOKIE, token, cookieOptions);
  return res;
}
