import { NextResponse } from "next/server";
import { recordIn } from "@/lib/friends";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// 来路统计：用户从友链站点带 ?ref=qd001 进入本站 → 前端 RefTracker 上报这里
export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (typeof code === "string" && code) await recordIn(code, clientIp(req));
  } catch {
    // 忽略
  }
  return NextResponse.json({ ok: true });
}
