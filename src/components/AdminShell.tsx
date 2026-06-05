"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const MENU = [
  { href: "/admin", label: "数据看板" },
  { href: "/admin/users", label: "用户管理" },
  { href: "/admin/books", label: "内容管理" },
  { href: "/admin/links", label: "友链管理" },
];

export default function AdminShell({
  admin,
  children,
}: {
  admin: { username: string };
  children: React.ReactNode;
}) {
  const path = usePathname() || "";
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-[#f0f2f5] text-[#333]">
      {/* 左侧菜单 */}
      <aside className="flex w-44 shrink-0 flex-col overflow-y-auto bg-[#2c3e50] text-white/80">
        <div className="px-4 py-4 text-base font-bold text-white">51书库 · 后台</div>
        <nav className="flex-1">
          {MENU.map((m) => {
            const active = m.href === "/admin" ? path === "/admin" : path.startsWith(m.href);
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`block px-4 py-3 text-sm transition-colors hover:bg-black/20 ${
                  active ? "bg-black/30 font-medium text-white" : ""
                }`}
              >
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 右侧 */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
          <span className="text-sm text-gray-400">管理后台</span>
          <span className="flex items-center gap-3 text-sm">
            <span className="text-gray-700">{admin.username}</span>
            <button onClick={logout} className="text-[#c0392b] hover:underline">退出</button>
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
