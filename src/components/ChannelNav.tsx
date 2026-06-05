"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

type Cat = { slug: string; name: string; channel: string };
type Chan = { ckey: string; name: string };

export default function ChannelNav({ channels, categories }: { channels: Chan[]; categories: Cat[] }) {
  const path = usePathname() || "/";
  // 频道 key → URL：boy 为根，其余为 /{ckey}
  const hrefOf = (ckey: string) => (ckey === "boy" ? "/" : `/${ckey}`);

  // 当前频道
  let channel = "boy";
  if (path.startsWith("/category/")) {
    const slug = path.split("/")[2] || "";
    channel = categories.find((c) => c.slug === slug)?.channel || "boy";
  } else {
    const m = channels.find((c) => c.ckey !== "boy" && path === `/${c.ckey}`);
    if (m) channel = m.ckey;
  }

  const cats = categories.filter((c) => c.channel === channel);
  const tab = (active: boolean) =>
    `rounded px-2.5 py-0.5 text-[13px] transition-colors ${
      active ? "bg-[var(--accent)] text-white" : "text-white/60 hover:text-white"
    }`;

  return (
    <nav className="bg-[var(--nav-bg)] text-white">
      <div className="mx-auto flex max-w-[1000px] flex-wrap items-center gap-y-1 px-2 text-sm">
        <span className="mr-1 flex items-center gap-1 border-r border-white/15 py-1.5 pr-2">
          {channels.map((ch) => (
            <Link key={ch.ckey} href={hrefOf(ch.ckey)} className={tab(channel === ch.ckey)}>
              {ch.name}
            </Link>
          ))}
        </span>
        <Link href={hrefOf(channel)} className="px-3 py-2.5 font-bold hover:bg-black/30">首页</Link>
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
