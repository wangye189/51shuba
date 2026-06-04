"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  bookId: number;
  bookTitle: string;
  chapterTitle: string;
  idx: number;
  total: number;
  content: string;
  prevHref: string | null;
  nextHref: string | null;
  catalogHref: string;
};

const THEMES = [
  { key: "white", label: "白", bg: "#ffffff", fg: "#2b2b2b" },
  { key: "sepia", label: "米黄", bg: "#f5ecd8", fg: "#5b4636" },
  { key: "green", label: "护眼", bg: "#cfe8d4", fg: "#33433a" },
  { key: "dark", label: "夜间", bg: "#1c1c1e", fg: "#a6a6a6" },
];
const FS_MIN = 15, FS_MAX = 30;

export default function ReaderShell(p: Props) {
  const router = useRouter();
  const [fs, setFs] = useState(19);
  const [lh, setLh] = useState(1.9);
  const [themeKey, setThemeKey] = useState("white");
  const [bright, setBright] = useState(0); // 0~0.55 暗色遮罩
  const [bars, setBars] = useState(false);
  const [panel, setPanel] = useState(false);
  const startY = useRef(0);

  const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];

  // 载入记忆
  useEffect(() => {
    setFs(Number(localStorage.getItem("rd_fs")) || 19);
    setLh(Number(localStorage.getItem("rd_lh")) || 1.9);
    setThemeKey(localStorage.getItem("rd_theme") || "white");
    setBright(Number(localStorage.getItem("rd_bright")) || 0);
    document.documentElement.classList.add("reader-mode");
    return () => document.documentElement.classList.remove("reader-mode");
  }, []);

  const save = (k: string, v: string | number) => localStorage.setItem(k, String(v));
  const setFontSize = (v: number) => { v = Math.min(FS_MAX, Math.max(FS_MIN, v)); setFs(v); save("rd_fs", v); };
  const setLine = (v: number) => { setLh(v); save("rd_lh", v); };
  const setTheme = (k: string) => { setThemeKey(k); save("rd_theme", k); };
  const setBrightness = (v: number) => { setBright(v); save("rd_bright", v); };

  // 点中间区域 toggle 工具栏（避开链接/按钮）
  const onTapText = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    if (panel) { setPanel(false); return; }
    setBars((b) => !b);
  };

  const go = (href: string | null) => href && router.push(href);

  const paras = p.content.split("\n\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain"
      style={{ background: theme.bg, color: theme.fg, WebkitTapHighlightColor: "transparent" }}
    >
      {/* 亮度遮罩 */}
      <div className="pointer-events-none fixed inset-0 z-[60] bg-black" style={{ opacity: bright }} />

      {/* 顶栏 */}
      <header
        className="fixed inset-x-0 top-0 z-[70] flex h-12 items-center gap-2 border-b px-3 backdrop-blur transition-transform duration-200"
        style={{
          background: theme.bg + "ee", borderColor: theme.fg + "22", color: theme.fg,
          transform: bars ? "translateY(0)" : "translateY(-110%)",
        }}
      >
        <button onClick={() => router.push(`/book/${p.bookId}`)} className="shrink-0 px-1 text-lg" aria-label="返回">‹</button>
        <div className="min-w-0 flex-1 truncate text-[14px] font-medium">{p.bookTitle}</div>
        <span className="shrink-0 text-[12px] opacity-60">{p.idx}/{p.total}</span>
      </header>

      {/* 正文 */}
      <article onClick={onTapText} className="mx-auto min-h-screen max-w-2xl px-5 pb-28 pt-14">
        <h1 className="mb-5 text-[19px] font-bold">{p.chapterTitle}</h1>
        <div style={{ fontSize: fs, lineHeight: lh }}>
          {paras.map((t, i) => (
            <p key={i} className="mb-4 indent-8" style={{ fontSize: fs, lineHeight: lh }}>{t}</p>
          ))}
        </div>
        {/* 章末翻页 */}
        <div className="mt-8 flex gap-3">
          <button onClick={() => go(p.prevHref)} disabled={!p.prevHref}
            className="flex-1 rounded-lg border py-2.5 text-[14px] disabled:opacity-30"
            style={{ borderColor: theme.fg + "33" }}>上一章</button>
          <button onClick={() => go(p.nextHref)} disabled={!p.nextHref}
            className="flex-1 rounded-lg py-2.5 text-[14px] font-medium text-white disabled:opacity-40"
            style={{ background: "#b8001f" }}>下一章</button>
        </div>
      </article>

      {/* 底栏 */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[70] flex h-14 items-stretch border-t backdrop-blur transition-transform duration-200"
        style={{
          background: theme.bg + "ee", borderColor: theme.fg + "22", color: theme.fg,
          transform: bars ? "translateY(0)" : "translateY(110%)",
        }}
      >
        <button onClick={() => go(p.prevHref)} disabled={!p.prevHref} className="flex-1 text-[13px] disabled:opacity-30">上一章</button>
        <button onClick={() => router.push(p.catalogHref)} className="flex-1 text-[13px]">目录</button>
        <button onClick={() => go(p.nextHref)} disabled={!p.nextHref} className="flex-1 text-[13px] disabled:opacity-30">下一章</button>
        <button onClick={() => { setPanel((v) => !v); setBars(true); }} className="flex-1 text-[13px] font-medium">设置</button>
      </nav>

      {/* 设置抽屉 */}
      <div
        className="fixed inset-x-0 bottom-14 z-[75] border-t px-4 py-4 transition-transform duration-200"
        style={{
          background: theme.bg, borderColor: theme.fg + "22", color: theme.fg,
          transform: panel ? "translateY(0)" : "translateY(130%)",
          boxShadow: "0 -8px 24px rgba(0,0,0,.12)",
        }}
      >
        {/* 亮度 */}
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">亮度</span>
          <span className="text-[11px]">☀</span>
          <input type="range" min={0} max={0.55} step={0.05} value={bright}
            onChange={(e) => setBrightness(Number(e.target.value))} className="flex-1 accent-[#b8001f]" />
          <span className="text-[14px]">🌙</span>
        </div>
        {/* 字号 */}
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">字号</span>
          <button onClick={() => setFontSize(fs - 1)} className="h-9 flex-1 rounded-lg border text-[15px]" style={{ borderColor: theme.fg + "33" }}>A－</button>
          <span className="w-10 text-center text-[14px]">{fs}</span>
          <button onClick={() => setFontSize(fs + 1)} className="h-9 flex-1 rounded-lg border text-[18px]" style={{ borderColor: theme.fg + "33" }}>A＋</button>
        </div>
        {/* 行距 */}
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">行距</span>
          {[["紧", 1.6], ["适中", 1.9], ["松", 2.3]].map(([lab, v]) => (
            <button key={lab as string} onClick={() => setLine(v as number)}
              className="h-9 flex-1 rounded-lg border text-[13px]"
              style={{ borderColor: theme.fg + "33", background: lh === v ? "#b8001f" : "transparent", color: lh === v ? "#fff" : theme.fg }}>{lab}</button>
          ))}
        </div>
        {/* 背景主题 */}
        <div className="flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">背景</span>
          {THEMES.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)}
              className="h-9 flex-1 rounded-lg border text-[12px]"
              style={{ background: t.bg, color: t.fg, borderColor: themeKey === t.key ? "#b8001f" : t.fg + "33", borderWidth: themeKey === t.key ? 2 : 1 }}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
