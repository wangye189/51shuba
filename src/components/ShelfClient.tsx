"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Cover from "@/components/Cover";

type ShelfItem = {
  id: number;
  title: string;
  author?: string;
  cover?: string | null;
  last_idx?: number | null;
  last_title?: string | null;
  channel?: string;
};

export default function ShelfClient({ channels }: { channels: { ckey: string; name: string }[] }) {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState("boy"); // 默认男生

  useEffect(() => {
    try {
      const c = localStorage.getItem("ch");
      if (c && channels.some((x) => x.ckey === c)) setTab(c);
    } catch {}
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        if (me.user) {
          setLoggedIn(true);
          const d = await fetch("/api/shelf").then((r) => r.json());
          setItems(Array.isArray(d.books) ? d.books : []);
        } else {
          const local = JSON.parse(localStorage.getItem("shelf") || "[]");
          setItems(Array.isArray(local) ? local.filter((x) => x && x.id != null) : []);
        }
      } catch {}
      setReady(true);
    })();
  }, [channels]);

  const remove = async (id: number) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    if (loggedIn) {
      await fetch("/api/shelf", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: id }),
      });
    } else {
      localStorage.setItem("shelf", JSON.stringify(next));
    }
  };

  const shown = items.filter((b) => (b.channel || "boy") === tab);

  return (
    <div className="space-y-3">
      {ready && !loggedIn && (
        <div className="panel flex items-center justify-between p-3 text-[13px]">
          <span className="text-[var(--muted)]">登录后书架跟账号走，换设备也能看</span>
          <Link href="/login" className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-white">
            登录 / 注册
          </Link>
        </div>
      )}

      <section className="panel">
        <div className="block-head">
          <h2>我的书架</h2>
          <span className="more">{shown.length} 本</span>
        </div>

        {/* 频道切换（低调下划线 tab）*/}
        <div className="flex gap-5 border-b border-[var(--border)] px-4">
          {channels.map((ch) => (
            <button
              key={ch.ckey}
              onClick={() => setTab(ch.ckey)}
              className={`relative py-2.5 text-[13px] transition-colors ${
                tab === ch.ckey
                  ? "font-medium text-[var(--accent)] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[#333]"
              }`}
            >
              {ch.name}
            </button>
          ))}
        </div>

        {!ready ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">加载中…</p>
        ) : shown.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">
            该频道书架还是空的，去 <Link href="/" className="link">逛逛</Link> 收藏吧。
          </p>
        ) : (
          <ul>
            {shown.map((b) => (
              <li key={b.id} className="flex items-center gap-3 border-b border-dashed border-[#eee] p-3 last:border-0">
                <Link href={`/book/${b.id}`} className="shrink-0">
                  <Cover src={b.cover ?? null} title={b.title} className="h-16 w-12 rounded" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/book/${b.id}`} className="link block truncate text-[14px] font-medium">{b.title}</Link>
                  {b.author && <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{b.author}</p>}
                  {b.last_title && (
                    <Link href={`/book/${b.id}/${b.last_idx ?? ""}`} className="mt-0.5 block truncate text-[12px] text-[#666] hover:text-[var(--accent)]">
                      继续读：{b.last_title}
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => remove(b.id)}
                  className="ml-1 shrink-0 rounded border border-[var(--border)] px-2 py-1 text-[12px] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  移除
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
