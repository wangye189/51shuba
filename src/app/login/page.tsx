"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 登录后把游客的本地书架并入账号
async function mergeLocalShelf() {
  try {
    const local = JSON.parse(localStorage.getItem("shelf") || "[]");
    if (Array.isArray(local)) {
      for (const item of local) {
        if (item?.id) {
          await fetch("/api/shelf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId: item.id }),
          });
        }
      }
    }
    localStorage.removeItem("shelf"); // 已并入账号，避免重复
  } catch { /* ignore */ }
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (username.trim().length < 2) { setErr("用户名至少 2 个字符"); return; }
    if (password.length < 6) { setErr("密码至少 6 位"); return; }
    setLoading(true);
    try {
      const r = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await r.json();
      if (!r.ok) { setErr(data.error || "操作失败"); setLoading(false); return; }
      await mergeLocalShelf();
      router.push("/shelf");
      router.refresh();
    } catch {
      setErr("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[400px] space-y-3 py-6">
      <section className="panel p-6">
        {/* 切换 */}
        <div className="mb-5 flex border-b border-[var(--border)]">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setErr(""); }}
              className={`flex-1 pb-2.5 text-[15px] font-bold ${
                mode === m
                  ? "border-b-2 border-[var(--accent)] text-[var(--accent)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {m === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="账号（随便取，唯一即可）"
            autoComplete="username"
            className="h-11 w-full rounded-lg border border-[var(--border)] px-3 text-[14px] outline-none focus:border-[var(--accent)]"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="密码（至少 6 位）"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="h-11 w-full rounded-lg border border-[var(--border)] px-3 text-[14px] outline-none focus:border-[var(--accent)]"
          />
          {err && <p className="text-[13px] text-[var(--accent)]">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-[var(--accent)] text-[15px] font-medium text-white active:opacity-80 disabled:opacity-50"
          >
            {loading ? "请稍候…" : mode === "login" ? "登录" : "注册并登录"}
          </button>
        </form>

        <p className="mt-4 text-center text-[12px] leading-relaxed text-[var(--muted)]">
          无需邮箱或手机号，账号唯一即可。<br />
          登录后书架会跟着账号走，换设备也能看。
        </p>
      </section>
      <p className="text-center text-[12px] text-[var(--muted)]">
        <Link href="/" className="link">返回首页</Link>
      </p>
    </div>
  );
}
