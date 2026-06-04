// 全站导航即时反馈：点击后立刻显示加载条/骨架，避免"点了没反应"的卡顿感
export default function Loading() {
  return (
    <>
      {/* 顶部加载进度条 */}
      <div className="fixed inset-x-0 top-0 z-[100] h-0.5 overflow-hidden bg-transparent">
        <div className="h-full w-1/3 animate-[loadingbar_1s_ease-in-out_infinite] bg-[var(--accent)]" />
      </div>
      <div className="mx-auto flex max-w-[1000px] items-center justify-center px-4 py-20 text-sm text-[var(--muted)]">
        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--accent)]" />
        加载中…
      </div>
    </>
  );
}
