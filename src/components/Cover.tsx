"use client";
import { useState } from "react";

// 封面：优先真封面图，加载失败回退渐变色块（带书名）
export default function Cover({
  src, title, className = "",
}: { src: string | null; title: string; className?: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className={`grid place-items-center bg-gradient-to-br from-[#c0392b] to-[#7b1010] px-1 text-center font-bold leading-tight text-white ${className}`}>
        <span className="line-clamp-3 text-[13px]">{title}</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src={src} alt={title} loading="lazy" onError={() => setErr(true)}
      className={`bg-[#eee] object-cover ${className}`} />
  );
}
