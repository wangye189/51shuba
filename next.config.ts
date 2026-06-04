import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // 钉死文件追踪根目录到本项目（否则父目录 lockfile 让 Next 把根推断到上层，
  // 导致 Netlify 插件追踪不到产物）
  outputFileTracingRoot: path.resolve(process.cwd()),
  // 原生模块走 Node 加载（better-sqlite3 仅本地采集脚本用，运行时用 libsql）
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
