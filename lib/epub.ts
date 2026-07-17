import JSZip from "jszip";

export interface EpubMeta {
  title?: string;
  creator?: string;
  language?: string;
}

export interface EpubSection {
  id: string;
  href: string;
  absolutePath: string;
  viewport: { width: number; height: number };
}

export interface EpubNavItem {
  label: string;
  href: string;
  subitems?: EpubNavItem[];
}

export interface EpubBook {
  meta: EpubMeta;
  spine: EpubSection[];
  toc: EpubNavItem[];
  loadSectionHtml(idx: number): Promise<string>;
  destroy(): void;
}

const DEFAULT_VIEWPORT = { width: 794, height: 1123 };

function resolvePath(base: string, rel: string): string {
  if (/^[a-z]+:\/\//i.test(rel) || rel.startsWith("#")) return rel;
  const baseParts = base.split("/").filter(Boolean);
  const relParts = rel.split("/");
  for (const part of relParts) {
    if (part === "..") baseParts.pop();
    else if (part === "." || part === "") continue;
    else baseParts.push(part);
  }
  return baseParts.join("/");
}

function dirOf(path: string): string {
  const i = path.lastIndexOf("/");
  return i >= 0 ? path.slice(0, i + 1) : "";
}

function parseViewport(xhtml: string): { width: number; height: number } {
  const m = xhtml.match(
    /<meta[^>]+name=["']viewport["'][^>]*content=["']([^"']+)["']/i,
  );
  if (!m) return DEFAULT_VIEWPORT;
  const content = m[1];
  const w = parseInt(content.match(/width=(\d+)/)?.[1] ?? "", 10);
  const h = parseInt(content.match(/height=(\d+)/)?.[1] ?? "", 10);
  return {
    width: Number.isNaN(w) ? DEFAULT_VIEWPORT.width : w,
    height: Number.isNaN(h) ? DEFAULT_VIEWPORT.height : h,
  };
}

const ASSET_SELECTOR = [
  "img[src]",
  "video[src]",
  "audio[src]",
  "source[src]",
  "track[src]",
  "link[href]",
  "script[src]",
  "a[href]",
].join(",");

export async function openEpub(buf: ArrayBuffer): Promise<EpubBook> {
  const zip = await JSZip.loadAsync(buf);

  const containerXml = await zip.file("META-INF/container.xml")?.async("string");
  if (!containerXml) throw new Error("无效的 EPUB：缺少 META-INF/container.xml");
  const containerDoc = new DOMParser().parseFromString(
    containerXml,
    "application/xml",
  );
  const opfPath =
    containerDoc.querySelector("rootfile")?.getAttribute("full-path") ?? "";
  if (!opfPath) throw new Error("无效的 EPUB：container.xml 未声明 OPF 路径");

  const opfXml = await zip.file(opfPath)?.async("string");
  if (!opfXml) throw new Error(`无效的 EPUB：缺少 ${opfPath}`);
  const opfDoc = new DOMParser().parseFromString(opfXml, "application/xml");
  const opfDir = dirOf(opfPath);

  const meta: EpubMeta = {
    title:
      opfDoc.querySelector("metadata > title")?.textContent?.trim() ||
      undefined,
    creator:
      opfDoc.querySelector("metadata > creator")?.textContent?.trim() ||
      undefined,
    language:
      opfDoc.querySelector("metadata > language")?.textContent?.trim() ||
      undefined,
  };

  const manifest = new Map<
    string,
    { href: string; mediaType: string; properties?: string }
  >();
  opfDoc.querySelectorAll("manifest > item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type") ?? "";
    const properties = item.getAttribute("properties") ?? undefined;
    if (id && href) manifest.set(id, { href, mediaType, properties });
  });

  const spine: EpubSection[] = [];
  opfDoc.querySelectorAll("spine > itemref").forEach((ref) => {
    const idref = ref.getAttribute("idref");
    if (!idref) return;
    const item = manifest.get(idref);
    if (!item) return;
    spine.push({
      id: idref,
      href: item.href,
      absolutePath: resolvePath(opfDir, item.href),
      viewport: DEFAULT_VIEWPORT,
    });
  });

  // 读 nav.xhtml 提取 TOC
  const toc: EpubNavItem[] = [];
  const navManifest = [...manifest.values()].find(
    (m) => m.properties?.includes("nav"),
  );
  if (navManifest) {
    const navPath = resolvePath(opfDir, navManifest.href);
    const navXml = await zip.file(navPath)?.async("string");
    if (navXml) {
      const navDoc = new DOMParser().parseFromString(
        navXml,
        "application/xhtml+xml",
      );
      const parseNav = (ol: Element | null): EpubNavItem[] => {
        if (!ol) return [];
        return [...ol.children]
          .filter((li) => li.tagName.toLowerCase() === "li")
          .map((li) => {
            const a = li.querySelector("a");
            const childOl = li.querySelector("ol");
            return {
              label: a?.textContent?.trim() ?? "",
              href: a?.getAttribute("href") ?? "",
              subitems: parseNav(childOl),
            };
          })
          .filter((n) => n.label);
      };
      const tocNav = navDoc.querySelector("nav[*|type='toc'] ol, nav ol");
      toc.push(...parseNav(tocNav));
    }
  }

  const blobUrlCache = new Map<string, string>();
  const loadAsset = async (absPath: string): Promise<string | null> => {
    const normalized = decodeURIComponent(absPath).replace(/^\//, "");
    const cached = blobUrlCache.get(normalized);
    if (cached) return cached;
    const file = zip.file(normalized);
    if (!file) return null;
    const blob = await file.async("blob");
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(normalized, url);
    return url;
  };

  const loadSectionHtml = async (idx: number): Promise<string> => {
    const section = spine[idx];
    if (!section) return "";
    const xhtml =
      (await zip.file(section.absolutePath)?.async("string")) ?? "";
    if (!xhtml) return "";
    section.viewport = parseViewport(xhtml);

    const doc = new DOMParser().parseFromString(
      xhtml,
      "application/xhtml+xml",
    );
    const secDir = dirOf(section.absolutePath);

    const nodes = [...doc.querySelectorAll(ASSET_SELECTOR)];
    await Promise.all(
      nodes.map(async (el) => {
        const isHref = el.hasAttribute("href") && !el.hasAttribute("src");
        const attr = isHref ? "href" : "src";
        const val = el.getAttribute(attr);
        if (!val) return;
        if (
          /^(blob:|data:|https?:|scenebox-attachment:|mailto:|tel:|#)/i.test(
            val,
          )
        )
          return;
        const abs = resolvePath(secDir, val);
        const url = await loadAsset(abs);
        if (url) el.setAttribute(attr, url);
        else el.removeAttribute(attr);
      }),
    );

    // ponytail: XHTML 的 <script><![CDATA[...]]></script> 在 iframe.srcdoc (HTML 解析) 下
    // 会被当成 JS 代码开头 → 语法错误 → 整段脚本不执行（点击事件跳转失效）。剥掉 CDATA 包装。
    doc.querySelectorAll("script").forEach((s) => {
      const text = s.textContent ?? "";
      const cleaned = text
        .replace(/\/<!\[CDATA\[/g, "")
        .replace(/\/\/<!\[CDATA\[/g, "")
        .replace(/<!\[CDATA\[\s*/g, "")
        .replace(/\s*\/\/\]\]>/g, "")
        .replace(/\s*\]\]>/g, "");
      if (cleaned !== text) s.textContent = cleaned;
    });

    // ponytail: 所有 a 链接 hover 显示手型指针（包括 href 被移除的 .event-link）
    const styleEl = doc.createElement("style");
    styleEl.textContent = "a { cursor: pointer !important; }";
    doc.head.appendChild(styleEl);

    const serialized = new XMLSerializer().serializeToString(doc);
    // 序列化后 XMLSerializer 可能再加 CDATA，再次剥掉
    return serialized.replace(
      /<script([^>]*)>([\s\S]*?)<\/script>/g,
      (_m, attrs, body) =>
        `<script${attrs}>${body
          .replace(/<!\[CDATA\[\s*/g, "")
          .replace(/\s*\]\]>/g, "")}</script>`,
    );
  };

  const destroy = () => {
    blobUrlCache.forEach((url) => URL.revokeObjectURL(url));
    blobUrlCache.clear();
  };

  return { meta, spine, toc, loadSectionHtml, destroy };
}
