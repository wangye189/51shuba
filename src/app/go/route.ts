import { redirect } from "next/navigation";
import { recordOut } from "@/lib/friends";
import { site } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// 去路统计 + 跳转：本站点击友链 → /go?code=qd001 → 记一次去路 → 302 到真实地址
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") || "";
  const link = await recordOut(code, clientIp(req));
  redirect(link ? link.url : site.url);
}
