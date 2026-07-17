import type { NextConfig } from "next";

// GitHub Pages 部署到 https://<user>.github.io/<repo>/，需要 basePath。
// 本地 dev 不设（默认空），CI 通过 NEXT_PUBLIC_BASE_PATH 传入。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  // GitHub Pages 静态文件目录结构友好
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
