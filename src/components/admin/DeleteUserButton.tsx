"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteUserButton({ id, username }: { id: number; username: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const del = async () => {
    if (!confirm(`确定删除用户「${username}」？其书架收藏会一并删除，不可恢复。`)) return;
    setBusy(true);
    try {
      await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={del}
      disabled={busy}
      className="text-xs text-[#c0392b] hover:underline disabled:opacity-50"
    >
      {busy ? "…" : "删除"}
    </button>
  );
}
