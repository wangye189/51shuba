import Link from "next/link";
import type { BookRow } from "@/lib/repo";
import { categoryName } from "@/lib/config";

/** 经典书库「带封面的横排列表项」：封面 + 书名/作者/分类/简介/最新章节 */
export default function BookListRow({ book }: { book: BookRow }) {
  return (
    <div className="flex gap-3 border-b border-dashed border-[#eee] p-3 last:border-0 hover:bg-[#fcf7f7]">
      <Link href={`/book/${book.id}`} className="shrink-0">
        <div className="grid h-24 w-18 place-items-center rounded bg-gradient-to-br from-[#c0392b] to-[#7b1010] px-1 text-center text-[13px] font-bold text-white">
          {book.title}
        </div>
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link href={`/book/${book.id}`} className="link text-[15px] font-bold">
            {book.title}
          </Link>
          <span className="text-[12px] text-[var(--muted)]">
            {book.author} · [{categoryName(book.category)}] · {book.status}
          </span>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-[#777]">
          {book.intro}
        </p>
        <p className="mt-1 truncate text-[12px]">
          最新：
          <Link
            href={`/book/${book.id}/${book.chap_count}`}
            className="text-[#555] hover:text-[var(--accent)]"
          >
            {book.last_title || "—"}
          </Link>
        </p>
      </div>
    </div>
  );
}
