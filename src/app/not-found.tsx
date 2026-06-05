import Link from "next/link";
import { getCategories } from "@/lib/taxonomy";
import { hotRanking } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  // 注意：此处仅取热门书做引导内链
  let hot: { id: number; title: string }[] = [];
  let categories: { slug: string; name: string }[] = [];
  try {
    [hot, categories] = await Promise.all([
      hotRanking(8).then((rows) => rows.map((b) => ({ id: b.id, title: b.title }))),
      getCategories(),
    ]);
  } catch {
    hot = [];
  }

  return (
    <div className="panel mx-auto max-w-xl p-8 text-center">
      <p className="text-5xl font-extrabold text-[var(--accent)]">404</p>
      <h1 className="mt-3 text-lg font-bold text-[#333]">页面不存在或已下架</h1>
      <p className="mt-2 text-[13px] text-[var(--muted)]">
        你访问的页面找不到了，去看看其它好书吧。
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link
          href="/"
          className="rounded bg-[var(--accent)] px-5 py-2 text-[13px] text-white hover:opacity-90"
        >
          返回首页
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className="rounded border border-[var(--border)] px-3 py-2 text-[13px] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {c.name}
          </Link>
        ))}
      </div>

      {hot.length > 0 && (
        <div className="mt-6 border-t border-dashed border-[#eee] pt-4 text-left">
          <h2 className="mb-2 text-[14px] font-bold text-[#333]">热门推荐</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {hot.map((b) => (
              <Link key={b.id} href={`/book/${b.id}`} className="link text-[13px]">
                {b.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
