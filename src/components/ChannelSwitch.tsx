"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 顶部细条里的低调男女频道切换；用 localStorage 记住所选频道
export default function ChannelSwitch({ channels }: { channels: { ckey: string; name: string }[] }) {
  const path = usePathname() || "/";
  const [stored, setStored] = useState<string | null>(null);
  useEffect(() => {
    try { setStored(localStorage.getItem("ch")); } catch {}
  }, [path]);

  const hrefOf = (ckey: string) => (ckey === "boy" ? "/" : `/${ckey}`);

  let channel = "boy";
  const m = channels.find((c) => c.ckey !== "boy" && path === `/${c.ckey}`);
  if (m) channel = m.ckey;
  else if (path !== "/" && stored && channels.some((c) => c.ckey === stored)) channel = stored;

  const pick = (ckey: string) => {
    try { localStorage.setItem("ch", ckey); } catch {}
  };

  return (
    <span className="flex items-center gap-1.5">
      {channels.map((ch, i) => (
        <span key={ch.ckey} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-300">·</span>}
          <Link
            href={hrefOf(ch.ckey)}
            onClick={() => pick(ch.ckey)}
            className={channel === ch.ckey ? "font-medium text-[var(--accent)]" : "hover:text-[var(--accent)]"}
          >
            {ch.name}
          </Link>
        </span>
      ))}
    </span>
  );
}
