import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const AUTH_COOKIE = "auth_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 天
const SECRET = () =>
  new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-change-me-in-netlify-env");

// 注意：本地是 http，secure 必须按环境，否则浏览器不保存 cookie，本地登录会失败
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export type SessionUser = { id: number; username: string };

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function signToken(user: SessionUser): Promise<string> {
  return new SignJWT({ uid: user.id, username: user.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET());
}

/** 从 cookie 读取并校验当前登录用户（服务端组件 / route handler 用）*/
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const c = await cookies();
    const tok = c.get(AUTH_COOKIE)?.value;
    if (!tok) return null;
    const { payload } = await jwtVerify(tok, SECRET());
    return { id: Number(payload.uid), username: String(payload.username) };
  } catch {
    return null;
  }
}
