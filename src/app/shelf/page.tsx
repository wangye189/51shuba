"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type ShelfItem = { id: number; title: string };

export default function ShelfPage() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const arr = JSON.parse(localStorage.getItem("shelf") || "[]");
      setItems(Array.isArray(arr) ? arr.filter((x) => x && x.id != null) : []);
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const remove = (id: number) => {
    const next = items.filter((x) => x.id !== id);
    setItems(next);
    localStorage.setItem("shelf", JSON.stringify(next));
  };

  return (
    <div className="space-y-3">
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
                className="flex items-center justify-between border-b border-dashed border-[#eee] px-3 py-3 last:border-0"
              >
                <Link href={`/book/${b.id}`} className="link min-w-0 flex-1 truncate text-[14px]">
                  {b.title}
                </Link>
                <button
                  onClick={() => remove(b.id)}
                  className="ml-3 shrink-0 rounded border border-[var(--border)] px-2 py-1 text-[12px] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
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
