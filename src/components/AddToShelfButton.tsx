"use client";
import { useEffect, useState } from "react";

export default function AddToShelfButton({
  bookId,
  bookTitle,
  channel,
}: {
  bookId: number;
  bookTitle: string;
  channel: string;
}) {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [faved, setFaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetch("/api/auth/me").then((r) => r.json());
        if (me.user) {
          setUser(me.user);
          const d = await fetch("/api/shelf").then((r) => r.json());
          setFaved((d.books || []).some((b: { id: number }) => b.id === bookId));
        } else {
          setFaved(JSON.parse(localStorage.getItem("shelf") || "[]").some((x: { id: number }) => x?.id === bookId));
        }
      } catch {}
    })();
  }, [bookId]);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    if (user) {
      const adding = !faved;
      setFaved(adding);
      try {
        await fetch("/api/shelf", {
          method: adding ? "POST" : "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookId }),
        });
      } catch {
        setFaved(!adding);
      }
    } else {
      let s: { id: number; title: string; channel?: string }[] = [];
      try { s = JSON.parse(localStorage.getItem("shelf") || "[]").filter((x: { id: number }) => x?.id != null); } catch {}
      const i = s.findIndex((x) => x.id === bookId);
      if (i >= 0) s.splice(i, 1);
      else s.unshift({ id: bookId, title: bookTitle, channel: channel || "boy" });
      localStorage.setItem("shelf", JSON.stringify(s));
      setFaved(i < 0);
    }
    setBusy(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className="w-full rounded-lg border py-2.5 text-center text-[14px] font-medium transition-colors active:opacity-80 disabled:opacity-60"
      style={{
        borderColor: faved ? "#b8001f" : "var(--border)",
        color: faved ? "#b8001f" : "#555",
      }}
    >
      {faved ? "✓ 已在书架" : "＋ 加入书架"}
    </button>
  );
}
