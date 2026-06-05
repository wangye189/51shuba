import Link from "next/link";
import type { BookRow } from "@/lib/repo";
import { coverUrl } from "@/lib/config";
import { categoryNameOf } from "@/lib/taxonomy";
import Cover from "@/components/Cover";

/** 经典书库「带封面的横排列表项」：真封面 + 书名/作者/分类/简介/最新章节 */
export default async function BookListRow({ book }: { book: BookRow }) {
  // 最新章节用真实 last_idx（不能用 chap_count，缺章时会 404）；无章节则退到详情页
  const lastHref = book.last_idx != null ? `/book/${book.id}/${book.last_idx}` : `/book/${book.id}`;
  const catName = await categoryNameOf(book.category);
  return (
    <div className="flex gap-3 border-b border-dashed border-[#eee] p-3 last:border-0 hover:bg-[#fcf7f7]">
      <Link href={`/book/${book.id}`} className="shrink-0">
        <Cover src={coverUrl(book.source, book.cover)} title={book.title} className="h-24 w-[4.5rem] rounded shadow-sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link href={`/book/${book.id}`} className="link text-[15px] font-bold">
            {book.title}
          </Link>
          <span className="text-[12px] text-[var(--muted)]">
            {book.author} · [{catName}] · {book.status}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#777]">
          {book.intro}
        </p>
        <p className="mt-1 truncate text-[12px]">
          最新：
          <Link href={lastHref} className="text-[#555] hover:text-[var(--accent)]">
            {book.last_title || "—"}
          </Link>
        </p>
      </div>
    </div>
  );
}
