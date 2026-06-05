"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.refresh();
  };

  if (!ready) return <span className="inline-block w-14" />;

  return user ? (
    <span className="flex items-center gap-3">
      <Link href="/shelf" className="hover:text-[var(--accent)]">{user.username}</Link>
      <button onClick={logout} className="hover:text-[var(--accent)]">退出</button>
    </span>
  ) : (
    <Link href="/login" className="hover:text-[var(--accent)]">登录/注册</Link>
  );
}
