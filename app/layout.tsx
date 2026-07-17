import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://yjyinfo.github.io/scenebox-reader";
const TITLE = "SceneBox Reader - 在线免费 EPUB 电子书阅读";
const DESCRIPTION =
  "SceneBox Reader 是纯前端 EPUB 阅读器，无需上传，文件本地解析。支持单页连续、双页、双页连续三种视图，缩放、打印、暗黑模式，离线可用。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | SceneBox Reader",
  },
  description: DESCRIPTION,
  applicationName: "SceneBox Reader",
  generator: "Next.js",
  keywords: [
    "SceneBox Reader",
    "EPUB 阅读器",
    "在线阅读",
    "电子书阅读",
    "纯前端",
    "免费阅读器",
    "双页阅读",
    "暗黑模式",
    "离线阅读",
  ],
  authors: [{ name: "SceneBox Reader" }],
  creator: "SceneBox Reader",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "SceneBox Reader",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  category: "books",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SceneBox Reader",
  applicationCategory: "BookApplication",
  operatingSystem: "Any",
  inLanguage: "zh-CN",
  offers: { "@type": "Offer", price: "0", priceCurrency: "CNY" },
  featureList: [
    "单页连续阅读",
    "双页阅读",
    "双页连续阅读",
    "暗黑模式",
    "拖拽打开文件",
    "本地解析隐私安全",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className="h-full antialiased"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
