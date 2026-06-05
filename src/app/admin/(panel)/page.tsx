import { adminStats } from "@/lib/repo";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const s = await adminStats();
  const cards = [
    { label: "注册用户", value: s.users },
    { label: "今日新增用户", value: s.todayUsers },
    { label: "书籍总数", value: s.books },
    { label: "章节总数", value: s.chapters },
    { label: "书架收藏总数", value: s.shelves },
  ];
  return (
    <div>
      <h1 className="mb-4 text-lg font-bold text-[#2c3e50]">数据看板</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className="mt-2 text-2xl font-bold text-[#2c3e50]">{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
