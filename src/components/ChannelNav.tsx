"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Cat = { slug: string; name: string; channel: string };
type Chan = { ckey: string; name: string };

export default function ChannelNav({ channels, categories }: { channels: Chan[]; categories: Cat[] }) {
  const path = usePathname() || "/";
  const [stored, setStored] = useState<string | null>(null);
  useEffect(() => {
    try { setStored(localStorage.getItem("ch")); } catch {}
  }, [path]);

  // 频道 key → URL：boy 为根，其余为 /{ckey}
  const hrefOf = (ckey: string) => (ckey === "boy" ? "/" : `/${ckey}`);

  // 当前频道：分类页看分类归属；频道首页看 URL；其余通用页（排行/完本/书架/书）沿用记住的频道
  let channel = "boy";
  if (path.startsWith("/category/")) {
    const slug = path.split("/")[2] || "";
    channel = categories.find((c) => c.slug === slug)?.channel || "boy";
  } else {
    const m = channels.find((c) => c.ckey !== "boy" && path === `/${c.ckey}`);
    if (m) channel = m.ckey;
    else if (path !== "/" && stored && channels.some((c) => c.ckey === stored)) channel = stored;
  }

  const cats = categories.filter((c) => c.channel === channel);
  return (
    <nav className="bg-[var(--nav-bg)] text-white">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center gap-y-1 px-2 text-sm">
        <Link href={hrefOf(channel)} className="px-3 py-2.5 font-bold hover:bg-black/30">首页</Link>
        {cats.map((c) => (
          <Link key={c.slug} href={`/category/${c.slug}`} className="px-3 py-2.5 hover:bg-black/30">
            {c.name}
          </Link>
        ))}
        <Link href={channel === "boy" ? "/rank" : `/${channel}/rank`} className="px-3 py-2.5 hover:bg-black/30">排行榜</Link>
        <Link href={channel === "boy" ? "/complete" : `/${channel}/complete`} className="px-3 py-2.5 hover:bg-black/30">完本</Link>
        <Link href="/shelf" className="px-3 py-2.5 hover:bg-black/30">书架</Link>
      </div>
    </nav>
  );
}
