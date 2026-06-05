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
};

export default function ShelfPage() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        if (me.user) {
          setLoggedIn(true);
          const data = await fetch("/api/shelf").then((r) => r.json());
          setItems(Array.isArray(data.books) ? data.books : []);
        } else {
          const local = JSON.parse(localStorage.getItem("shelf") || "[]");
          setItems(Array.isArray(local) ? local.filter((x) => x?.id != null) : []);
        }
      } catch { /* ignore */ }
      setReady(true);
    })();
  }, []);

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
          <span className="more">{items.length} 本</span>
        </div>
        {!ready ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">加载中…</p>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-[var(--muted)]">
            书架还是空的，去 <Link href="/" className="link">首页</Link> 找本书，在阅读页点「加入书架」即可收藏。
          </p>
        ) : (
          <ul>
            {items.map((b) => (
              <li
                key={b.id}
                className="flex items-center gap-3 border-b border-dashed border-[#eee] p-3 last:border-0"
              >
                <Link href={`/book/${b.id}`} className="shrink-0">
                  <Cover src={b.cover ?? null} title={b.title} className="h-16 w-12 rounded" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/book/${b.id}`} className="link block truncate text-[14px] font-medium">
                    {b.title}
                  </Link>
                  {b.author && <p className="mt-0.5 truncate text-[12px] text-[var(--muted)]">{b.author}</p>}
                  {b.last_title && (
                    <Link
                      href={`/book/${b.id}/${b.last_idx ?? ""}`}
                      className="mt-0.5 block truncate text-[12px] text-[#666] hover:text-[var(--accent)]"
                    >
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
