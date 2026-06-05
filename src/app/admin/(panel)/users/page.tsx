import { listUsers } from "@/lib/repo";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function AdminUsers() {
  const users = await listUsers(100);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#2c3e50]">用户管理</h1>
        <span className="text-sm text-gray-400">最近 {users.length} 人</span>
      </div>
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">账号</th>
              <th className="px-3 py-2 text-center">书架收藏</th>
              <th className="px-3 py-2 text-left">注册时间</th>
              <th className="px-3 py-2 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-400">暂无用户</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-400">{u.id}</td>
                  <td className="px-3 py-2.5 font-medium">{u.username}</td>
                  <td className="px-3 py-2.5 text-center">{u.shelf_count}</td>
                  <td className="px-3 py-2.5 text-gray-500">{u.created_at}</td>
                  <td className="px-3 py-2.5 text-center">
                    <DeleteUserButton id={u.id} username={u.username} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
