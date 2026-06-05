"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

type Chap = { idx: number; no: number; title: string; content: string; nextIdx: number | null };

type Props = {
  bookId: number;
  bookTitle: string;
  total: number;
  prevHref: string | null;
  catalogHref: string;
  initial: Chap;
};

const THEMES = [
  { key: "white", label: "白", bg: "#ffffff", fg: "#2b2b2b", bar: "#f7f7f7" },
  { key: "sepia", label: "米黄", bg: "#f5ecd8", fg: "#5b4636", bar: "#efe4cb" },
  { key: "green", label: "护眼", bg: "#cfe8d4", fg: "#33433a", bar: "#c2dec8" },
  { key: "dark", label: "夜间", bg: "#1c1c1e", fg: "#a6a6a6", bar: "#252528" },
];
const FS_MIN = 15, FS_MAX = 30;

const ICON = {
  list: "M4 6h16M4 12h16M4 18h16",
  prev: "M15 5l-7 7 7 7",
  moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  settings: "M3 14v-4M3 7V3M12 14V8M12 5V3M21 14v-4M21 7V3M1 10h4M10 8h4M19 10h4",
};
const Ic = ({ d }: { d: string }) => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const toParas = (c: string) => c.split("\n\n").map((s) => s.trim()).filter(Boolean);

export default function ReaderShell(p: Props) {
  const [fs, setFs] = useState(20);
  const [lh, setLh] = useState(2.0);
  const [themeKey, setThemeKey] = useState("white");
  const [bright, setBright] = useState(0);
  const [bars, setBars] = useState(true);
  const [panel, setPanel] = useState(false);

  const [chaps, setChaps] = useState<Chap[]>([p.initial]);
  const [curNo, setCurNo] = useState(p.initial.no);
  const [curTitle, setCurTitle] = useState(p.initial.title);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const secRefs = useRef<Record<number, HTMLElement | null>>({});

  const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];

  useEffect(() => {
    setFs(Number(localStorage.getItem("rd_fs")) || 20);
    setLh(Number(localStorage.getItem("rd_lh")) || 2.0);
    setThemeKey(localStorage.getItem("rd_theme") || "white");
    setBright(Number(localStorage.getItem("rd_bright")) || 0);
    document.documentElement.classList.add("reader-mode");
    return () => {
      document.documentElement.classList.remove("reader-mode");
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", "#ffffff");
    };
  }, []);

  useEffect(() => {
    let m = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!m) { m = document.createElement("meta"); m.name = "theme-color"; document.head.appendChild(m); }
    m.setAttribute("content", theme.bar);
  }, [theme.bar]);

  const save = (k: string, v: string | number) => localStorage.setItem(k, String(v));
  const setFontSize = (v: number) => { v = Math.min(FS_MAX, Math.max(FS_MIN, v)); setFs(v); save("rd_fs", v); };
  const setLine = (v: number) => { setLh(v); save("rd_lh", v); };
  const setTheme = (k: string) => { setThemeKey(k); save("rd_theme", k); };
  const setBrightness = (v: number) => { setBright(v); save("rd_bright", v); };
  const toggleNight = () => setTheme(themeKey === "dark" ? "white" : "dark");

  // 无缝续载下一章
  const loadNext = useCallback(async () => {
    if (loadingRef.current) return;
    const last = chaps[chaps.length - 1];
    if (!last || last.nextIdx == null) return;
    loadingRef.current = true;
    try {
      const r = await fetch(`/api/chapter/${p.bookId}/${last.nextIdx}`);
      if (r.ok) {
        const c = (await r.json()) as Chap | null;
        if (c && c.content) setChaps((prev) => (prev.some((x) => x.idx === c.idx) ? prev : [...prev, c]));
      }
    } catch { /* 忽略 */ }
    loadingRef.current = false;
  }, [chaps, p.bookId]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 1500) loadNext();
    // 顶栏跟随当前章
    let cn = chaps[0]?.no, ct = chaps[0]?.title;
    for (const c of chaps) {
      const s = secRefs.current[c.idx];
      if (s && s.getBoundingClientRect().top <= 64) { cn = c.no; ct = c.title; }
    }
    if (cn && cn !== curNo) { setCurNo(cn); setCurTitle(ct!); }
  }, [chaps, curNo, loadNext]);

  const onTapText = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input")) return;
    if (panel) { setPanel(false); return; }
    setBars((b) => !b);
  };

  const item = "flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[11px]";
  const last = chaps[chaps.length - 1];

  return (
    <div ref={scrollRef} onScroll={onScroll} className="fixed inset-0 z-40 overflow-y-auto overscroll-contain"
      style={{ background: theme.bg, color: theme.fg, WebkitTapHighlightColor: "transparent" }}>
      <div className="pointer-events-none fixed inset-0 z-[60] bg-black" style={{ opacity: bright }} />

      {/* 顶栏 */}
      <header className="fixed inset-x-0 top-0 z-[70] flex h-12 items-center gap-2 px-3 transition-transform duration-200"
        style={{ background: theme.bar, borderBottom: `1px solid ${theme.fg}22`, color: theme.fg, transform: bars ? "translateY(0)" : "translateY(-110%)" }}>
        <Link href={`/book/${p.bookId}`} className="shrink-0 px-1 text-2xl leading-none" aria-label="返回">‹</Link>
        <div className="min-w-0 flex-1 truncate text-[14px] font-medium">{curTitle}</div>
        <span className="shrink-0 text-[12px] opacity-50">{curNo}/{p.total}</span>
        <Link href={p.catalogHref} className="shrink-0 px-1 text-[13px]">目录</Link>
      </header>

      {/* 正文（多章连续）*/}
      <div onClick={onTapText} className="mx-auto max-w-2xl px-5 pb-28 pt-16">
        {chaps.map((c) => (
          <section key={c.idx} ref={(el) => { secRefs.current[c.idx] = el; }} className="min-h-[40vh]">
            <h2 className="mb-5 mt-6 text-[19px] font-bold first:mt-0">{c.title}</h2>
            <div style={{ fontSize: fs, lineHeight: lh }}>
              {toParas(c.content).map((t, i) => (
                <p key={i} className="mb-4 indent-8" style={{ fontSize: fs, lineHeight: lh }}>{t}</p>
              ))}
            </div>
          </section>
        ))}
        <div className="py-8 text-center text-[13px] opacity-50">
          {loadingRef.current ? "加载下一章…" : last?.nextIdx == null ? "—— 已是最新章节 ——" : "下拉继续阅读"}
        </div>
      </div>

      {/* 底栏：图标工具栏 */}
      <nav className="fixed inset-x-0 bottom-0 z-[70] flex h-16 items-stretch transition-transform duration-200"
        style={{ background: theme.bar, borderTop: `1px solid ${theme.fg}22`, color: theme.fg, transform: bars ? "translateY(0)" : "translateY(110%)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Link href={p.catalogHref} className={item}><Ic d={ICON.list} />目录</Link>
        {p.prevHref
          ? <Link href={p.prevHref} className={item}><Ic d={ICON.prev} />上一章</Link>
          : <span className={`${item} opacity-30`}><Ic d={ICON.prev} />上一章</span>}
        <button onClick={toggleNight} className={item}><Ic d={themeKey === "dark" ? ICON.sun : ICON.moon} />{themeKey === "dark" ? "日间" : "夜间"}</button>
        <button onClick={() => { setPanel((v) => !v); setBars(true); }} className={item}><Ic d={ICON.settings} />设置</button>
      </nav>

      {/* 设置抽屉 */}
      <div className="fixed inset-x-0 bottom-16 z-[75] px-4 py-4 transition-transform duration-200"
        style={{ background: theme.bar, borderTop: `1px solid ${theme.fg}22`, color: theme.fg, transform: panel ? "translateY(0)" : "translateY(130%)", boxShadow: "0 -8px 24px rgba(0,0,0,.18)" }}>
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">亮度</span>
          <span className="text-[11px]">☀</span>
          <input type="range" min={0} max={0.55} step={0.05} value={bright} onChange={(e) => setBrightness(Number(e.target.value))} className="flex-1 accent-[#b8001f]" />
          <span className="text-[14px]">🌙</span>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">字号</span>
          <button onClick={() => setFontSize(fs - 1)} className="h-9 flex-1 rounded-lg border text-[15px]" style={{ borderColor: theme.fg + "33" }}>A－</button>
          <span className="w-10 text-center text-[14px]">{fs}</span>
          <button onClick={() => setFontSize(fs + 1)} className="h-9 flex-1 rounded-lg border text-[18px]" style={{ borderColor: theme.fg + "33" }}>A＋</button>
        </div>
        <div className="mb-3 flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">行距</span>
          {([["紧", 1.6], ["适中", 2.0], ["松", 2.4]] as [string, number][]).map(([lab, v]) => (
            <button key={lab} onClick={() => setLine(v)} className="h-9 flex-1 rounded-lg border text-[13px]"
              style={{ borderColor: theme.fg + "33", background: lh === v ? "#b8001f" : "transparent", color: lh === v ? "#fff" : theme.fg }}>{lab}</button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="w-10 text-[12px] opacity-60">背景</span>
          {THEMES.map((t) => (
            <button key={t.key} onClick={() => setTheme(t.key)} className="h-9 flex-1 rounded-lg text-[12px]"
              style={{ background: t.bg, color: t.fg, border: `${themeKey === t.key ? 2 : 1}px solid ${themeKey === t.key ? "#b8001f" : t.fg + "33"}` }}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
