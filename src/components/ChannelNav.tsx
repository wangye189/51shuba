"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { categoryChannel, channelCategories, type Channel } from "@/lib/config";

export default function ChannelNav() {
  const path = usePathname() || "/";
  // 当前频道：/girl 或 女生分类 → girl，其余 → boy
  let channel: Channel = "boy";
  if (path === "/girl") channel = "girl";
  else if (path.startsWith("/category/")) channel = categoryChannel(path.split("/")[2] || "");

  const cats = channelCategories(channel);
  const homeHref = channel === "girl" ? "/girl" : "/";
  const tab = (active: boolean) =>
    `rounded px-2.5 py-0.5 text-[13px] transition-colors ${
      active ? "bg-[var(--accent)] text-white" : "text-white/60 hover:text-white"
    }`;

  return (
    <nav className="bg-[var(--nav-bg)] text-white">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center gap-y-1 px-2 text-sm">
        {/* 男生 / 女生 切换 */}
        <span className="mr-1 flex items-center gap-1 border-r border-white/15 py-1.5 pr-2">
          <Link href="/" className={tab(channel === "boy")}>男生</Link>
          <Link href="/girl" className={tab(channel === "girl")}>女生</Link>
        </span>
        <Link href={homeHref} className="px-3 py-2.5 font-bold hover:bg-black/30">首页</Link>
        {cats.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="px-3 py-2.5 hover:bg-black/30">
            {c.name}
          </Link>
        ))}
        <Link href="/rank" className="px-3 py-2.5 hover:bg-black/30">排行榜</Link>
        <Link href="/complete" className="px-3 py-2.5 hover:bg-black/30">完本</Link>
        <Link href="/shelf" className="px-3 py-2.5 hover:bg-black/30">书架</Link>
      </div>
    </nav>
  );
}
