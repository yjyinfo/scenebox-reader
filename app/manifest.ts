import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SceneBox Reader",
    short_name: "SceneBox",
    description:
      "纯前端 EPUB 阅读器，支持单页连续、双页、双页连续视图，缩放、打印、暗黑模式。",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f7f8",
    theme_color: "#f7f7f8",
    lang: "zh-CN",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
