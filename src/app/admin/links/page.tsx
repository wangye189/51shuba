import { revalidatePath } from "next/cache";
import type { Metadata } from "next";
import { isAdmin, setAdminCookie, clearAdminCookie, ADMIN_KEY } from "@/lib/admin";
import { listLinks, createLink, toggleLink, statsForLinks, dailyStats } from "@/lib/friends";
import { site } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "友链统计后台", robots: { index: false, follow: false } };

// ===== Server Actions =====
async function loginAction(formData: FormData) {
  "use server";
  if (String(formData.get("password")) === ADMIN_KEY) await setAdminCookie();
  revalidatePath("/admin/links");
}
async function logoutAction() {
  "use server";
  await clearAdminCookie();
  revalidatePath("/admin/links");
}
async function createAction(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const code = String(formData.get("code") || "").trim();
  const url = String(formData.get("url") || "").trim();
  const domain = String(formData.get("domain") || "").trim();
  if (name && code && url) {
    try {
      await createLink({ name, code, url, domain });
    } catch {
      // code 重复等忽略
    }
  }
  revalidatePath("/admin/links");
}
async function toggleAction(formData: FormData) {
  "use server";
  await toggleLink(Number(formData.get("id")));
  revalidatePath("/admin/links");
}

export default async function AdminLinksPage() {
  if (!(await isAdmin())) {
    return (
      <div className="panel mx-auto max-w-sm p-6">
        <h1 className="mb-3 text-lg font-bold">友链统计后台</h1>
        <form action={loginAction} className="space-y-3">
          <input
            type="password"
            name="password"
            placeholder="管理口令"
            className="h-9 w-full rounded border border-[var(--border)] px-3 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button className="h-9 w-full rounded bg-[var(--accent)] text-sm text-white hover:opacity-90">
            登录
          </button>
        </form>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          开发口令默认 admin888，上线请改环境变量 ADMIN_KEY。
        </p>
      </div>
    );
  }

  const [stats, daily] = await Promise.all([statsForLinks(30), dailyStats(14)]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">友链统计后台</h1>
        <form action={logoutAction}>
          <button className="text-[12px] text-[var(--muted)] hover:text-[var(--accent)]">退出</button>
        </form>
      </div>

      {/* 新增友链 */}
      <section className="panel p-4">
        <div className="mb-2 text-[14px] font-bold">新增友链</div>
        <form action={createAction} className="grid gap-2 sm:grid-cols-5">
          <input name="name" placeholder="站点名称" className="h-9 rounded border border-[var(--border)] px-2 text-[13px]" />
          <input name="domain" placeholder="域名(可选)" className="h-9 rounded border border-[var(--border)] px-2 text-[13px]" />
          <input name="code" placeholder="渠道值 如 qd001" className="h-9 rounded border border-[var(--border)] px-2 text-[13px]" />
          <input name="url" placeholder="跳转 URL" className="h-9 rounded border border-[var(--border)] px-2 text-[13px]" />
          <button className="h-9 rounded bg-[var(--accent)] text-[13px] text-white hover:opacity-90">添加</button>
        </form>
      </section>

      {/* 统计表（近30天）*/}
      <section className="panel">
        <div className="block-head"><h2>友链效果（近 30 天）</h2></div>
        <table className="up-table">
          <thead>
            <tr>
              <th>站点</th><th>渠道值</th>
              <th>来路PV</th><th>来路UV</th>
              <th>去路PV</th><th>去路UV</th>
              <th>去路链接</th><th>状态</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-[var(--muted)]">暂无友链，先在上方添加</td></tr>
            ) : stats.map((s) => (
              <tr key={s.id}>
                <td className="font-medium">{s.name}</td>
                <td>{s.code}</td>
                <td>{s.in_pv}</td><td>{s.in_uv}</td>
                <td>{s.out_pv}</td><td>{s.out_uv}</td>
                <td className="max-w-[120px] truncate">
                  <a href={`/go?code=${s.code}`} className="link" target="_blank">/go?code={s.code}</a>
                </td>
                <td>{s.status ? "启用" : "停用"}</td>
                <td>
                  <form action={toggleAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="text-[var(--link)] hover:text-[var(--accent)]">
                      {s.status ? "停用" : "启用"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 每日报表 */}
      <section className="panel">
        <div className="block-head"><h2>每日汇总（近 14 天）</h2></div>
        <table className="up-table">
          <thead><tr><th>日期</th><th>来路PV</th><th>去路PV</th></tr></thead>
          <tbody>
            {daily.length === 0 ? (
              <tr><td colSpan={3} className="text-center text-[var(--muted)]">暂无数据</td></tr>
            ) : daily.map((d) => (
              <tr key={d.day}><td>{d.day}</td><td>{d.in_pv}</td><td>{d.out_pv}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="px-1 text-[12px] text-[var(--muted)]">
        来路埋点：把站外链接设为 <code>{site.url}/?ref=渠道值</code>；去路埋点：站内友链指向 <code>{site.url}/go?code=渠道值</code>。24h 内同 IP 同向去重计 UV，原始日志保留 30 天自动清理。
      </p>
    </div>
  );
}
