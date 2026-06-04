import { cookies } from "next/headers";

// 开发级口令保护（非完整登录体系）。上线请改 env ADMIN_KEY 并考虑接入正式鉴权 + 2FA。
export const ADMIN_KEY = process.env.ADMIN_KEY || "admin888";
const COOKIE = "b51_admin";

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE)?.value === ADMIN_KEY;
}

export async function setAdminCookie() {
  const c = await cookies();
  c.set(COOKIE, ADMIN_KEY, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(COOKIE);
}
