"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { openEpub, type EpubBook, type EpubNavItem } from "@/lib/epub";
import {
  detectLang,
  LANGS,
  translate,
  type Lang,
} from "@/lib/i18n";

type ViewMode = "single" | "double" | "double-scroll";
type Theme = "light" | "dark";

const VIEW_LABEL: Record<ViewMode, string> = {
  single: "单页连续",
  double: "双页",
  "double-scroll": "双页连续",
};

function ToolBtn({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-sm transition-colors sm:h-7 sm:min-w-7 sm:px-2 ${
        disabled
          ? "cursor-not-allowed text-muted/40"
          : active
            ? "bg-foreground text-background"
            : "text-muted hover:bg-background"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

const ICON = {
  single: (
    <Icon>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </Icon>
  ),
  double: (
    <Icon>
      <rect x="2" y="4" width="8" height="16" rx="1" />
      <rect x="14" y="4" width="8" height="16" rx="1" />
    </Icon>
  ),
  doubleScroll: (
    <Icon>
      <rect x="1" y="2" width="8" height="13" rx="1" />
      <rect x="11" y="2" width="8" height="13" rx="1" />
      <rect x="3" y="17" width="8" height="5" rx="1" opacity="0.5" />
      <rect x="13" y="17" width="8" height="5" rx="1" opacity="0.5" />
    </Icon>
  ),
};

export default function Reader() {
  const [pages, setPages] = useState<string[]>([]);
  const [viewports, setViewports] = useState<
    { width: number; height: number }[]
  >([]);
  const [toc, setToc] = useState<EpubNavItem[]>([]);
  const [meta, setMeta] = useState<{ title?: string; creator?: string }>({});
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [zoom, setZoom] = useState(1);
  const [zoomMode, setZoomMode] = useState<"auto" | "manual">("auto");
  const mainRef = useRef<HTMLElement | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("zh");
  const t = useCallback((k: string) => translate(lang, k), [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lang") as Lang | null;
      if (saved && LANGS.some((l) => l.code === saved)) {
        setLang(saved);
        return;
      }
    } catch {
      // ignore
    }
    setLang(detectLang());
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {
      // ignore
    }
  }, [lang]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const bookRef = useRef<EpubBook | null>(null);
  const pageRefs = useRef<(HTMLIFrameElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 启动时同步 <html> 上的 dark class（layout.tsx 的 bootstrap 已根据系统预设过）
  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  // 监听系统暗黑模式动态切换（用户没手动改过主题时跟随系统，包括 Windows/macOS/Linux）
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      try {
        if (localStorage.getItem("theme")) return; // 用户已手动设过偏好，不覆盖
      } catch {
        // ignore
      }
      setTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // 同步 <html> dark class，但不写 localStorage（只有用户手动切换时才写）
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((tt) => {
      const next = tt === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("theme", next);
      } catch {
        // ignore
      }
      return next;
    });
  };

  const openFile = useCallback(async (file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".epub") && file.type !== "application/epub+zip") {
      setError(t("fileTypeError"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const buf = await file.arrayBuffer();
      const book = await openEpub(buf);
      bookRef.current?.destroy();
      bookRef.current = book;
      setMeta(book.meta);
      setToc(book.toc);
      const htmls = await Promise.all(
        book.spine.map((_, i) => book.loadSectionHtml(i)),
      );
      setPages(htmls);
      setViewports(book.spine.map((s) => s.viewport));
      setCurrentPage(0);
      setLoaded(true);
      setZoomMode("auto");
    } catch (e) {
      setError(e instanceof Error ? e.message : t("parseError"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      bookRef.current?.destroy();
      bookRef.current = null;
    };
  }, []);

  const triggerOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) void openFile(file);
    },
    [openFile],
  );

  const scrollToPage = useCallback((idx: number) => {
    const iframe = pageRefs.current[idx];
    if (iframe) {
      iframe.scrollIntoView({ behavior: "smooth", block: "start" });
      setCurrentPage(idx);
    }
  }, []);

  const jumpToHref = useCallback(
    (href: string) => {
      const cleanHref = href.split("#")[0];
      const idx = bookRef.current?.spine.findIndex(
        (s) => s.href === cleanHref || s.absolutePath.endsWith(cleanHref),
      );
      if (idx !== undefined && idx >= 0) scrollToPage(idx);
    },
    [scrollToPage],
  );

  const pagePairs =
    viewMode === "double"
      ? Math.ceil(pages.length / 2)
      : Math.ceil(pages.length / 2);
  const goPrevPair = () => setCurrentPage((p) => Math.max(0, p - 1));
  const goNextPair = () =>
    setCurrentPage((p) => Math.min(pagePairs - 1, p + 1));

  useEffect(() => {
    if (viewMode !== "double" || !loaded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNextPair();
      if (e.key === "ArrowLeft") goPrevPair();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewMode, loaded, pagePairs]);

  const visiblePages =
    viewMode === "double"
      ? [currentPage * 2, currentPage * 2 + 1]
          .filter((i) => i < pages.length)
          .map((i) => ({ i, html: pages[i], vp: viewports[i] }))
      : pages.map((html, i) => ({ i, html, vp: viewports[i] }));

  const cols = viewMode === "single" ? 1 : 2;

  const zoomIn = () => {
    setZoomMode("manual");
    setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)));
  };
  const zoomOut = () => {
    setZoomMode("manual");
    setZoom((z) => Math.max(0.3, +(z - 0.1).toFixed(1)));
  };
  const zoomFit = useCallback(() => {
    const main = mainRef.current;
    if (!main) return;
    const available = main.clientWidth - 48; // grid p-6 = 24px 两侧
    // 单页：fit 宽度但上限 100%（PC 宽屏 100%，手机窄屏自动缩小）
    // 双页/双页连续：fit 宽度让两页并排铺满
    const targetW = viewMode === "single" ? 794 : 794 * 2 + 24;
    const maxZoom = viewMode === "single" ? 1 : 3;
    const scale = available / targetW;
    setZoom(Math.min(maxZoom, Math.max(0.3, +scale.toFixed(2))));
  }, [viewMode]);
  const zoomReset = () => {
    setZoomMode("auto");
    zoomFit();
  };

  // 自动 fit：文件加载、视图切换时自动算 zoom
  useEffect(() => {
    if (loaded && zoomMode === "auto") zoomFit();
  }, [loaded, zoomMode, viewMode, zoomFit]);

  // 窗口 resize 时如果还在 auto 模式，重新 fit
  useEffect(() => {
    if (!loaded || zoomMode !== "auto") return;
    const onResize = () => zoomFit();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [loaded, zoomMode, zoomFit]);

  // Ctrl/Cmd + 滚轮缩放
  useEffect(() => {
    if (!loaded) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => {
        const next = +(z + (e.deltaY < 0 ? 0.1 : -0.1)).toFixed(1);
        return Math.min(3, Math.max(0.3, next));
      });
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [loaded]);

  const handlePrint = useCallback(() => {
    if (pages.length === 0) return;
    const parser = new DOMParser();
    const styles: string[] = [];
    const bodies: string[] = [];
    pages.forEach((p) => {
      // ponytail: 用 text/html 解析（容忍 script 内 && 等 XML 非法字符），
      // 跟 reader iframe 的 srcdoc 解析行为一致；application/xhtml+xml 会失败。
      const doc = parser.parseFromString(p, "text/html");
      doc.querySelectorAll("style").forEach((s) => {
        // ponytail: 剥掉 page 自带的影响外层布局的规则（html/body/@page），
        // 否则 body height:1123 + overflow:hidden 会把 4 页裁成 1 页。
        const cleaned = (s.textContent ?? "")
          .replace(/@page\s*\{[^}]*\}/gi, "")
          .replace(/(^|\})\s*html\s*,\s*body\s*\{[^}]*\}/gi, "$1")
          .replace(/(^|\})\s*html\s*\{[^}]*\}/gi, "$1")
          .replace(/(^|\})\s*body\s*\{[^}]*\}/gi, "$1");
        if (cleaned.trim()) {
          styles.push(`<style>${cleaned}</style>`);
        }
      });
      const body = doc.body;
      if (body) {
        bodies.push(`<div class="__page"><div class="__scaled">${body.innerHTML}</div></div>`);
      }
    });
    const vp = viewports[0] ?? { width: 794, height: 1123 };

    const printFrame = document.createElement("iframe");
    printFrame.setAttribute("aria-hidden", "true");
    printFrame.style.cssText =
      "position:fixed;right:0;bottom:0;width:794px;height:1123px;border:0;opacity:0;pointer-events:none;z-index:-1;";
    document.body.appendChild(printFrame);
    const pdoc = printFrame.contentDocument;
    if (!pdoc) {
      printFrame.remove();
      return;
    }
    pdoc.open();
    pdoc.write(`<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${meta.title ?? "SceneBox Reader"}</title>
<style>
@page { size: A4; margin: 0; }
html, body { margin: 0 !important; padding: 0 !important; background: #fff; }
.__page {
  width: 210mm;
  height: 297mm;
  page-break-after: always;
  break-after: page;
  break-inside: avoid;
  position: relative;
  overflow: hidden;
  background: #fff;
}
.__page:last-child { page-break-after: auto; }
.__scaled {
  position: absolute;
  bottom: 10mm;
  left: 10mm;
  width: ${vp.width}px;
  height: ${vp.height}px;
  transform-origin: bottom left;
}
/* 打印时由 @page margin 控制纸张物理边距，
   EPUB 内为屏幕展示模拟的"纸边距"（body padding、footer absolute 边距等）全部清零，
   避免和打印机边距叠加 */
.__scaled,
.__scaled body {
  padding: 0 !important;
  margin: 0 !important;
}
.__scaled footer {
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  margin: 0 !important;
  padding: 6px 64px 8px 64px !important;
  box-sizing: border-box;
}
</style>
${styles.join("\n")}
</head>
<body>
${bodies.join("\n")}
</body>
</html>`);
    pdoc.close();

    let cleaned = false;
    let triggered = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      printFrame.remove();
    };
    const trigger = async () => {
      if (triggered || cleaned) return;
      triggered = true;
      const win = printFrame.contentWindow;
      const doc2 = printFrame.contentDocument;
      if (!win || !doc2) return cleanup();
      // .__page = printable area（A4 - 浏览器对话框 margin）。
      // .__scaled 用 transform scale fit + 底部居中：footer 紧贴 .__page 底部（= 打印机可印区底部），
      // 内容完整 fit 不会被裁。
      // .__page = A4 全尺寸（210×297mm）。@page margin 0 让 printable = A4。
      // .__scaled absolute bottom-left offset 10mm，scale fit (210-20)mm × (297-20)mm，
      // 留 10mm 安全区（等同打印机默认边距），避免机械不可印区裁切。
      const pageEl = doc2.querySelector(".__page");
      if (pageEl) {
        const pageW = pageEl.clientWidth;
        const pageH = pageEl.clientHeight;
        const safePx = (10 * 96) / 25.4; // 10mm @ 96dpi
        const targetW = pageW - safePx * 2;
        const targetH = pageH - safePx * 2;
        const scale = Math.min(targetW / vp.width, targetH / vp.height);
        doc2.querySelectorAll(".__scaled").forEach((el) => {
          (el as HTMLElement).style.transform = `scale(${scale})`;
        });
      }
      try {
        const imgs = [...doc2.images];
        await Promise.all(
          imgs.map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise<void>((resolve) => {
                  img.addEventListener("load", () => resolve(), { once: true });
                  img.addEventListener("error", () => resolve(), { once: true });
                }),
          ),
        );
      } catch {
        // ignore
      }
      win.focus();
      win.addEventListener("afterprint", cleanup, { once: true });
      try {
        win.print();
      } catch {
        cleanup();
      }
      setTimeout(cleanup, 120000);
    };
    printFrame.onload = () => void trigger();
    if (pdoc.readyState === "complete") {
      setTimeout(() => void trigger(), 50);
    }
  }, [pages, meta, viewports]);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-2 border-b border-border bg-panel px-2 py-1.5 sm:gap-3 sm:px-3 sm:py-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded px-2 py-1 text-sm hover:bg-background"
            aria-label={t("toggleSidebar")}
            title={t("toggleSidebarTitle")}
          >
            ☰
          </button>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">
              <span className="text-muted">{t("product")}</span>
              {meta.title && (
                <span className="ml-2 hidden text-foreground/80 sm:inline">
                  — {meta.title}
                </span>
              )}
            </div>
            {meta.creator && meta.creator !== "SceneBox" && (
              <div className="hidden truncate text-xs text-muted sm:block">
                {meta.creator}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-background px-1 py-0.5 sm:px-1.5 sm:py-1">
          <ToolBtn label={t("openFile")} onClick={triggerOpen}>
            📂
          </ToolBtn>
          <Divider />
          <ToolBtn label={t("zoomIn")} onClick={zoomIn} disabled={!loaded}>
            +
          </ToolBtn>
          <button
            type="button"
            onClick={zoomReset}
            disabled={!loaded}
            title={t("zoomReset")}
            className={`min-w-[2.25rem] rounded-full px-1.5 py-1 text-xs tabular-nums transition-colors sm:min-w-[3rem] sm:px-2 ${
              !loaded
                ? "cursor-not-allowed text-muted/40"
                : "text-muted hover:bg-background"
            }`}
          >
            {Math.round(zoom * 100)}%
          </button>
          <ToolBtn label={t("zoomOut")} onClick={zoomOut} disabled={!loaded}>
            −
          </ToolBtn>
          <Divider />
          <ToolBtn
            label={t("viewSingle")}
            active={viewMode === "single"}
            onClick={() => setViewMode("single")}
            disabled={!loaded}
          >
            {ICON.single}
          </ToolBtn>
          <ToolBtn
            label={t("viewDouble")}
            active={viewMode === "double"}
            onClick={() => setViewMode("double")}
            disabled={!loaded}
          >
            {ICON.double}
          </ToolBtn>
          <ToolBtn
            label={t("viewDoubleScroll")}
            active={viewMode === "double-scroll"}
            onClick={() => setViewMode("double-scroll")}
            disabled={!loaded}
          >
            {ICON.doubleScroll}
          </ToolBtn>
          <Divider />
          <ToolBtn
            label={t("print")}
            onClick={handlePrint}
            disabled={!loaded}
          >
            🖨
          </ToolBtn>
        </div>

        <div className="flex flex-1 items-center justify-end gap-1">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            className="cursor-pointer rounded bg-transparent px-1 py-1 text-base hover:bg-background"
            title={t("langLabel")}
            aria-label={t("langLabel")}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code} title={l.label}>
                {l.flag}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded px-2 py-1 text-base hover:bg-background"
            aria-label={t("toggleTheme")}
            title={theme === "dark" ? t("toLight") : t("toDark")}
          >
            {theme === "dark" ? "☀" : "🌙"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".epub,application/epub+zip"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void openFile(f);
            e.currentTarget.value = "";
          }}
        />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside
          className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-panel transition-[width] duration-200 ease-in-out"
          style={{ width: sidebarOpen ? "15rem" : "0" }}
          aria-hidden={!sidebarOpen}
        >
          <div className="flex h-full w-60 flex-col">
            <div className="border-b border-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {t("toc")}
            </div>
            <nav className="reader-scroll flex-1 overflow-y-auto p-1">
              {toc.length === 0 && (
                <div className="px-2 py-3 text-xs text-muted">
                  {loaded ? t("noToc") : t("openToShow")}
                </div>
              )}
              {toc.map((item, i) => (
                <button
                  key={`${item.href}-${i}`}
                  type="button"
                  onClick={() => jumpToHref(item.href)}
                  className="block w-full truncate rounded px-2 py-1.5 text-left text-sm hover:bg-background"
                  title={item.label}
                >
                  {item.label || t("noTitle")}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <div
          ref={(el) => {
            mainRef.current = el;
          }}
          className="reader-scroll relative min-w-0 flex-1 overflow-auto bg-muted/30"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={(e) => {
            if (!loaded && !loading) {
              e.preventDefault();
              triggerOpen();
            }
          }}
        >
          {loaded && (
            <div
              className="mx-auto p-6"
              style={{
                zoom,
                width: cols === 1 ? 794 : 794 * 2 + 24,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${cols}, 794px)`,
                  gap: 24,
                }}
              >
                {visiblePages.map(({ i, html }) => (
                  <iframe
                    key={i}
                    ref={(el) => {
                      pageRefs.current[i] = el;
                    }}
                    srcDoc={html}
                    title={`第 ${i + 1} 页`}
                    className="block bg-white shadow-lg"
                    style={{
                      width: 794,
                      height: 1123,
                      border: 0,
                    }}
                    sandbox="allow-scripts allow-same-origin"
                  />
                ))}
              </div>
            </div>
          )}

          {!loaded && !loading && (
            <div className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center px-6 text-center">
              <div className="bg-gradient-to-br from-foreground to-muted bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
                {t("product")}
              </div>
              <p className="mt-4 max-w-md text-sm text-muted">
                {t("placeholderHint")}
                <br />
                <span className="text-xs">{t("privacy")}</span>
              </p>
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-sm text-muted">
              {t("parsing")}
            </div>
          )}

          {dragOver && (
            <div className="pointer-events-none absolute inset-0 border-4 border-dashed border-blue-500 bg-blue-500/10" />
          )}

          {error && (
            <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded bg-red-600 px-3 py-1.5 text-sm text-white">
              {error}
            </div>
          )}
        </div>
      </div>

      {loaded && viewMode === "double" && (
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-panel px-3 py-2 text-sm">
          <button
            type="button"
            onClick={goPrevPair}
            disabled={currentPage === 0}
            className="rounded border border-border px-3 py-1 hover:bg-background disabled:opacity-40"
          >
            ← {t("prevPage")}
          </button>
          <span className="text-muted">
            {currentPage + 1} / {pagePairs}（{t("keyboardHint")}）
          </span>
          <button
            type="button"
            onClick={goNextPair}
            disabled={currentPage >= pagePairs - 1}
            className="rounded border border-border px-3 py-1 hover:bg-background disabled:opacity-40"
          >
            {t("nextPage")} →
          </button>
        </footer>
      )}
    </div>
  );
}
