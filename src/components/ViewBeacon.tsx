"use client";
import { useEffect } from "react";

/** 上报一次浏览量（每个会话每书每加载一次）。静态化页面也能统计。 */
export default function ViewBeacon({ bookId }: { bookId: number }) {
  useEffect(() => {
    const key = `viewed_${bookId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: bookId }),
      keepalive: true,
    }).catch(() => {});
  }, [bookId]);
  return null;
}
