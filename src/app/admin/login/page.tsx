"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const d = await r.json();
      if (!r.ok) { setErr(d.error || "登录失败"); setLoading(false); return; }
      router.push("/admin");
      router.refresh();
    } catch {
      setErr("网络错误，请重试");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#f0f2f5]">
      <form onSubmit={submit} className="w-[320px] rounded-xl bg-white p-6 shadow-lg">
        <h1 className="text-center text-lg font-bold text-[#2c3e50]">51书库 · 后台</h1>
        <p className="mb-5 mt-1 text-center text-xs text-gray-400">管理员登录</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="管理员账号"
          autoComplete="username"
          className="mb-3 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2c3e50]"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="密码"
          autoComplete="current-password"
          className="mb-3 h-10 w-full rounded border border-gray-300 px-3 text-sm outline-none focus:border-[#2c3e50]"
        />
        {err && <p className="mb-3 text-xs text-red-500">{err}</p>}
        <button
          disabled={loading}
          className="h-10 w-full rounded bg-[#2c3e50] text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "登录中…" : "登 录"}
        </button>
      </form>
    </div>
  );
}
