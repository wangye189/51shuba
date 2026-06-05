import Link from "next/link";
import { adminListBooks } from "@/lib/repo";
import { getCategories } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";

export default async function AdminBooks() {
  const [books, cats] = await Promise.all([adminListBooks(100), getCategories()]);
  const catName = (slug: string) => cats.find((c) => c.slug === slug)?.name || slug;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#2c3e50]">内容管理</h1>
        <span className="text-sm text-gray-400">最近 {books.length} 部</span>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">书名</th>
              <th className="px-3 py-2 text-left">作者</th>
              <th className="px-3 py-2 text-left">分类</th>
              <th className="px-3 py-2 text-center">章节</th>
              <th className="px-3 py-2 text-center">点击</th>
              <th className="px-3 py-2 text-left">状态</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-gray-400">暂无书籍</td></tr>
            ) : (
              books.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-400">{b.id}</td>
                  <td className="px-3 py-2.5 font-medium">
                    <Link href={`/book/${b.id}`} target="_blank" className="hover:text-[#c0392b]">{b.title}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{b.author}</td>
                  <td className="px-3 py-2.5 text-gray-600">{catName(b.category)}</td>
                  <td className="px-3 py-2.5 text-center">{b.chap_count}</td>
                  <td className="px-3 py-2.5 text-center">{b.views}</td>
                  <td className="px-3 py-2.5 text-gray-500">{b.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
