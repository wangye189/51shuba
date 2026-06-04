"use client";
import { useEffect, useState } from "react";

// 阅读设置：字号 / 行距 / 主题（日·护眼·夜间），作用于 #reader，记忆到 localStorage。
const THEMES = [
  { key: "day", label: "日", bg: "#fff", fg: "#333", bd: "#ddd" },
  { key: "sepia", label: "护眼", bg: "#f5ecd8", fg: "#5b4636", bd: "#e0d3b8" },
  { key: "night", label: "夜间", bg: "#1a1a1a", fg: "#c2c2c2", bd: "#444" },
];
const FS_MIN = 14, FS_MAX = 30;

function apply(fs: number, lh: number, theme: string) {
  const el = document.getElementById("reader");
  if (!el) return;
  el.style.setProperty("--reader-fs", `${fs}px`);
  el.style.setProperty("--reader-lh", String(lh));
  el.dataset.theme = theme;
}

export default function ReaderSettings() {
  const [fs, setFs] = useState(18);
  const [lh, setLh] = useState(1.9);
  const [theme, setTheme] = useState("day");
  const [open, setOpen] = useState(false);

  // 载入记忆
  useEffect(() => {
    const f = Number(localStorage.getItem("reader_fs")) || 18;
    const l = Number(localStorage.getItem("reader_lh")) || 1.9;
    const t = localStorage.getItem("reader_theme") || "day";
    setFs(f); setLh(l); setTheme(t);
    apply(f, l, t);
  }, []);

  const update = (nf: number, nl: number, nt: string) => {
    nf = Math.min(FS_MAX, Math.max(FS_MIN, nf));
    setFs(nf); setLh(nl); setTheme(nt);
    apply(nf, nl, nt);
    localStorage.setItem("reader_fs", String(nf));
    localStorage.setItem("reader_lh", String(nl));
    localStorage.setItem("reader_theme", nt);
  };

  const btn = "h-8 min-w-8 rounded border border-[var(--border)] px-2 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)]";

  return (
    <div className="relative flex justify-end">
      <button onClick={() => setOpen((o) => !o)} className={btn} aria-label="阅读设置">
        Aa 设置
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-30 w-64 rounded-lg border border-[var(--border)] bg-white p-3 text-[#333] shadow-lg">
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="text-[var(--muted)]">字号</span>
            <div className="flex gap-2">
              <button className={btn} onClick={() => update(fs - 2, lh, theme)}>A-</button>
              <span className="grid h-8 w-10 place-items-center text-[13px]">{fs}</span>
              <button className={btn} onClick={() => update(fs + 2, lh, theme)}>A+</button>
            </div>
          </div>
          <div className="mb-2 flex items-center justify-between text-[13px]">
            <span className="text-[var(--muted)]">行距</span>
            <div className="flex gap-2">
              <button className={btn} onClick={() => update(fs, Math.max(1.4, +(lh - 0.2).toFixed(1)), theme)}>窄</button>
              <button className={btn} onClick={() => update(fs, Math.min(2.6, +(lh + 0.2).toFixed(1)), theme)}>宽</button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[var(--muted)]">主题</span>
            <div className="flex gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => update(fs, lh, t.key)}
                  className={`h-8 rounded border px-2 text-[12px] ${theme === t.key ? "ring-2 ring-[var(--accent)]" : ""}`}
                  style={{ background: t.bg, color: t.fg, borderColor: t.bd }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
