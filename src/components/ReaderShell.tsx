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
  { key: "white", label: "白", bg: "#ffffff", fg: "#191919", bar: "#f5f5f5" },
  { key: "sepia", label: "米黄", bg: "#f5ecd8", fg: "#5b4636", bar: "#efe4cb" },
  { key: "green", label: "护眼", bg: "#cfe8d4", fg: "#33433a", bar: "#c2dec8" },
  { key: "dark", label: "夜间", bg: "#1c1c1e", fg: "#a6a6a6", bar: "#252528" },
];
const FS_MIN = 15, FS_MAX = 30;

const ICON = {
  list: "M4 6h16M4 12h16M4 18h16",
  prev: "M15 5l-7 7 7 7",
  next: "M9 5l7 7-7 7",
  moon: "M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  settings: "M3 14v-4M3 7V3M12 14V8M12 5V3M21 14v-4M21 7V3M1 10h4M10 8h4M19 10h4",
  star: "M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3 6.2 20.4l1.1-6.5L2.6 9.3l6.5-.9z",
};
const Ic = ({ d, fill = "none" }: { d: string; fill?: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const toParas = (c: string) => c.split("\n\n").map((s) => s.trim()).filter(Boolean);

export default function ReaderShell(p: Props) {
  const [fs, setFs] = useState(20);
  const [lh, setLh] = useState(1.8);
  const [themeKey, setThemeKey] = useState("white");
  const [bright, setBright] = useState(0);
  const [bars, setBars] = useState(true);
  const [panel, setPanel] = useState(false);
  const [faved, setFaved] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [chaps, setChaps] = useState<Chap[]>([p.initial]);
  const [curNo, setCurNo] = useState(p.initial.no);
  const [curTitle, setCurTitle] = useState(p.initial.title);
  const loadingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const secRefs = useRef<Record<number, HTMLElement | null>>({});
  const lastY = useRef(0);

  const theme = THEMES.find((t) => t.key === themeKey) || THEMES[0];

  useEffect(() => {
    setFs(Number(localStorage.getItem("rd_fs")) || 20);
    setLh(Number(localStorage.getItem("rd_lh")) || 1.8);
    setThemeKey(localStorage.getItem("rd_theme") || "white");
    setBright(Number(localStorage.getItem("rd_bright")) || 0);
    // 登录则查账号书架是否已收藏，否则查本地
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        if (me.user) {
          setUser(me.user);
          const data = await fetch("/api/shelf").then((r) => r.json());
          setFaved((data.books || []).some((b: { id: number }) => b.id === p.bookId));
        } else {
          setFaved(JSON.parse(localStorage.getItem("shelf") || "[]").some((x: { id: number }) => x?.id === p.bookId));
        }
      } catch { /* ignore */ }
    })();
    document.documentElement.classList.add("reader-mode");
    return () => {
      document.documentElement.classList.remove("reader-mode");
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", "#ffffff");
    };
  }, [p.bookId]);

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
  const toggleFav = async () => {
    // 已登录：写账号书架（跨设备）
    if (user) {
      const adding = !faved;
      setFaved(adding);
      try {
        await fetch("/api/shelf", {
          method: adding ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId: p.bookId }),
        });
      } catch { setFaved(!adding); }
      return;
    }
    // 游客：写本地书架
    let s: { id: number; title: string }[] = [];
    try { s = JSON.parse(localStorage.getItem("shelf") || "[]").filter((x: { id: number }) => x?.id != null); } catch {}
    const i = s.findIndex((x) => x.id === p.bookId);
    if (i >= 0) s.splice(i, 1); else s.unshift({ id: p.bookId, title: p.bookTitle });
    localStorage.setItem("shelf", JSON.stringify(s));
    setFaved(i < 0);
  };

  const loadNext = useCallback(async () => {
    if (loadingRef.current) return;
    const last = chaps[chaps.length - 1];
    if (!last || last.nextIdx == null) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      // 让"加载中"动画至少闪一下，给用户翻章的感知（CDN 静态 JSON 通常很快）
      const [c] = await Promise.all([
        fetch(`/api/chapter/${p.bookId}/${last.nextIdx}`).then((r) => (r.ok ? r.json() : null)) as Promise<Chap | null>,
        new Promise((res) => setTimeout(res, 350)),
      ]);
      if (c && c.content) setChaps((prev) => (prev.some((x) => x.idx === c.idx) ? prev : [...prev, c]));
    } catch { /* ignore */ }
    loadingRef.current = false;
    setLoading(false);
  }, [chaps, p.bookId]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const y = el.scrollTop;
    // 往下滑阅读 → 自动隐藏工具栏(沉浸)；往上滑(回看) → 唤出
    if (y > lastY.current + 6 && y > 40) { setBars(false); setPanel(false); }
    else if (y < lastY.current - 10) setBars(true);
    lastY.current = y;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 350) loadNext();
    // 找出「当前正在看的那一章」（顶部越过标题栏的最后一章）
    let cur = chaps[0];
    for (const c of chaps) {
      const s = secRefs.current[c.idx];
      if (s && s.getBoundingClientRect().top <= 64) cur = c;
    }
    if (cur && cur.no !== curNo) {
      setCurNo(cur.no);
      setCurTitle(cur.title);
      // 跟起点一样：滚到哪一章，浏览器地址栏 + 标题就同步成哪一章（刷新/分享/SEO 不丢位）
      try {
        history.replaceState(history.state, "", `/book/${p.bookId}/${cur.idx}`);
        document.title = `${cur.title} - ${p.bookTitle}`;
      } catch { /* ignore */ }
    }
  }, [chaps, curNo, loadNext, p.bookId, p.bookTitle]);

  // 下一章：滚到下一章开头（已加载则平滑滚动，否则先加载）
  const goNext = () => {
    const cur = chaps.find((c) => c.no === curNo) || chaps[chaps.length - 1];
    const ni = cur?.nextIdx;
    if (ni == null) return;
    const el = secRefs.current[ni];
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else loadNext().then(() => setTimeout(() => secRefs.current[ni]?.scrollIntoView({ behavior: "smooth" }), 400));
  };
  const curHasNext = (chaps.find((c) => c.no === curNo) || chaps[chaps.length - 1])?.nextIdx != null;

  const onTapText = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a,button,input")) return;
    if (panel) { setPanel(false); return; }
    setBars((b) => !b);
  };

  const opBtn = "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-3 text-[13px] font-medium";
  const icBtn = "flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px]";
  const last = chaps[chaps.length - 1];

  return (
    <div ref={scrollRef} onScroll={onScroll} className="fixed inset-0 z-40 overflow-y-auto overscroll-contain"
      style={{ background: theme.bg, color: theme.fg, WebkitTapHighlightColor: "transparent" }}>
      <div className="pointer-events-none fixed inset-0 z-[60] bg-black" style={{ opacity: bright }} />

      {/* 顶栏 */}
      <header className="fixed inset-x-0 top-0 z-[70] flex h-12 items-center gap-2 px-3 transition-transform duration-200"
        style={{ background: theme.bar, borderBottom: `1px solid ${theme.fg}22`, color: theme.fg, transform: bars ? "translateY(0)" : "translateY(-110%)" }}>
        <Link href={`/book/${p.bookId}`} className="-ml-1 shrink-0 px-1" aria-label="返回"><Ic d={ICON.prev} /></Link>
        <div className="min-w-0 flex-1 truncate text-[15px] font-medium">{curTitle}</div>
        <span className="shrink-0 text-[12px] tabular-nums opacity-50">{curNo}/{p.total}</span>
        <Link href={p.catalogHref} className="shrink-0 px-1 text-[13px] opacity-80">目录</Link>
      </header>

      {/* 正文（多章连续）*/}
      <div onClick={onTapText} className="mx-auto max-w-2xl px-5 pb-36 pt-16">
        {chaps.map((c) => (
          <section key={c.idx} ref={(el) => { secRefs.current[c.idx] = el; }} className="min-h-[40vh] scroll-mt-14">
            <h2 className="mb-6 mt-7 text-[22px] font-medium first:mt-0">{c.title}</h2>
            <div style={{ fontSize: fs, lineHeight: lh }}>
              {toParas(c.content).map((t, i) => (
                <p key={i} className="mb-4 indent-8" style={{ fontSize: fs, lineHeight: lh }}>{t}</p>
              ))}
            </div>
          </section>
        ))}
        <div className="flex items-center justify-center gap-2 py-10 text-center text-[13px] opacity-60">
          {loading ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              正在加载下一章…
            </>
          ) : last?.nextIdx == null ? "—— 已读到最新章节 ——" : "上滑，加载下一章"}
        </div>
      </div>

      {/* 底部菜单：两层（上=操作，下=图标工具）*/}
      <div className="fixed inset-x-0 bottom-0 z-[70] transition-transform duration-200"
        style={{ background: theme.bar, borderTop: `1px solid ${theme.fg}22`, color: theme.fg, transform: bars ? "translateY(0)" : "translateY(120%)", paddingBottom: "env(safe-area-inset-bottom)" }}>
        {/* 上层：上一章 / 加入书架 / 下一章 */}
        <div className="flex items-stretch gap-2 px-3 pb-1 pt-2">
          {p.prevHref
            ? <Link href={p.prevHref} className={opBtn} style={{ background: `${theme.fg}0d` }}>上一章</Link>
            : <span className={`${opBtn} opacity-30`} style={{ background: `${theme.fg}0d` }}>上一章</span>}
          <button onClick={toggleFav} className={opBtn} style={{ background: `${theme.fg}0d`, color: faved ? "#b8001f" : "inherit" }}>
            <Ic d={ICON.star} fill={faved ? "#b8001f" : "none"} />{faved ? "已在书架" : "加入书架"}
          </button>
          {curHasNext
            ? <button onClick={goNext} className={opBtn} style={{ background: `${theme.fg}0d` }}>下一章</button>
            : <span className={`${opBtn} opacity-40`} style={{ background: `${theme.fg}0d` }}>已是最新</span>}
        </div>
        {/* 下层：目录 / 夜间 / 设置 */}
        <div className="flex items-stretch">
          <Link href={p.catalogHref} className={icBtn}><Ic d={ICON.list} />目录</Link>
          <button onClick={toggleNight} className={icBtn}><Ic d={themeKey === "dark" ? ICON.sun : ICON.moon} />{themeKey === "dark" ? "日间" : "夜间"}</button>
          <button onClick={() => { setPanel((v) => !v); setBars(true); }} className={icBtn}><Ic d={ICON.settings} />设置</button>
        </div>
      </div>

      {/* 设置抽屉 */}
      <div className="fixed inset-x-0 bottom-[7.5rem] z-[75] px-4 py-4 transition-transform duration-200"
        style={{ background: theme.bar, borderTop: `1px solid ${theme.fg}22`, color: theme.fg, transform: panel ? "translateY(0)" : "translateY(160%)", boxShadow: "0 -8px 24px rgba(0,0,0,.18)" }}>
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
          {([["紧", 1.6], ["适中", 1.8], ["松", 2.2]] as [string, number][]).map(([lab, v]) => (
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
