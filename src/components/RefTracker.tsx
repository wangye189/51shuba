"use client";
import { useEffect } from "react";

/** 捕获来路渠道：URL 带 ?ref=qd001 时上报一次来路统计，然后从地址栏清掉 ref（不污染分享/收录）。 */
export default function RefTracker() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("ref");
    if (!code) return;
    const key = `ref_${code}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      fetch("/api/ref", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        keepalive: true,
      }).catch(() => {});
    }
    // 清理地址栏 ref 参数
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.pathname + url.search + url.hash);
  }, []);
  return null;
}
