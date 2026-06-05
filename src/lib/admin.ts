import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "./db";

// ===== 后台管理员账号体系 =====
export const ADMIN_COOKIE = "admin_token";
const MAX_AGE = 60 * 60 * 12; // 12 小时
const SECRET = () =>
  new TextEncoder().encode((process.env.JWT_SECRET || "dev-secret-change-me-in-netlify-env") + ":admin");

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

export type AdminUser = { id: number; username: string };
export type AdminRow = {
  id: number;
  username: string;
  password: string;
  totp_secret: string;
  totp_enabled: number;
};

export async function getAdminByUsername(username: string): Promise<AdminRow | undefined> {
  const db = await getDb();
  const r = await db.execute({
    sql: "SELECT id, username, password, totp_secret, totp_enabled FROM admins WHERE username = ?",
    args: [username],
  });
  return r.rows[0] as unknown as AdminRow | undefined;
}

export const verifyAdminPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export async function signAdminToken(a: AdminUser): Promise<string> {
  return new SignJWT({ aid: a.id, username: a.username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(SECRET());
}

/** 读取并校验当前后台登录管理员 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const c = await cookies();
    const tok = c.get(ADMIN_COOKIE)?.value;
    if (!tok) return null;
    const { payload } = await jwtVerify(tok, SECRET());
    return { id: Number(payload.aid), username: String(payload.username) };
  } catch {
    return null;
  }
}

// ===== 兼容旧的简易口令保护（友链管理 /admin/links 在用）=====
export const ADMIN_KEY = process.env.ADMIN_KEY || "admin888";
const LEGACY_COOKIE = "b51_admin";

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  if (c.get(LEGACY_COOKIE)?.value === ADMIN_KEY) return true;
  return (await getCurrentAdmin()) !== null;
}
export async function setAdminCookie() {
  const c = await cookies();
  c.set(LEGACY_COOKIE, ADMIN_KEY, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(LEGACY_COOKIE);
}
