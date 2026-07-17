<div align="center">

# 📖 SceneBox Reader

**Privacy-first EPUB reader. 100% client-side.**

Drop an `.epub` file → read it. Your file never leaves the browser.

📚 **Translations**: [English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español (Latinoamérica)](README.es.md)

[About SceneBox](#-about-scenebox) · [Features](#-features) · [Quick Start](#-quick-start) · [Keyboard Shortcuts](#-keyboard-shortcuts) · [Tech Stack](#-tech-stack) · [Contributing](#-contributing) · [License](#-license)

</div>

---

## 📦 About SceneBox

**SceneBox Reader** is the companion reader for reports exported by the **[SceneBox App](https://apps.apple.com/app/id6789491378)**.

> What happened at the scene? Where exactly is the problem? What evidence was there?

SceneBox helps you capture these answers completely and turn them into a report that anyone can understand at a glance.

It's designed for installations, after-sales repair, property handover, facility inspection, equipment maintenance, project acceptance, municipal complaints — any moment where you need a clear on-site record.

### What SceneBox does

**🎯 One capture, full picture** — Combine text, photos, videos, audio, and location in one place. Stop scattering key information across photo albums, memo apps, and chat logs. Add or rearrange entries anytime until the story is clear.

**✏️ Annotate the problem directly** — Add arrows and text on photos to point out faults, damage, install locations, or anything worth noting. Annotations are movable, resizable, rotatable, and recolorable. The original photo is always preserved.

**⏱️ Pin the exact moment** — When you hear an abnormal sound or spot a key frame in audio/video, add an event at that timestamp. Reviewing later jumps straight back to the moment — no scrubbing from the start.

**📶 Capture offline, no account needed** — No sign-up required. Keep shooting, recording, organizing, and previewing even in basements, server rooms, construction sites, or wherever the network drops.

SceneBox exports these reports as standard `.epub` files — and **SceneBox Reader** is the easiest way to read them on any device, without installing anything.

> 💡 **SceneBox Reader is also a fully standard EPUB reader** — open any `.epub` book from Project Gutenberg, Standard Ebooks, or anywhere else.

---

## ✨ Features

- **🔒 100% client-side** — Files parsed locally with `JSZip`, never uploaded to any server.
- **📐 Three view modes** — Single page continuous / Two pages / Two pages continuous.
- **🔍 Smart zoom** — Auto-fit on mobile/tablet, 100% on desktop. `Ctrl/⌘ + wheel` to override.
- **🖨️ Print** — Combines all pages into a single PDF, browser-native dialog with page-range selection.
- **🌗 System dark mode** — Follows OS theme on Windows/macOS/Linux/iOS/Android. Manual override persists.
- **🌍 5 languages** — English / 中文 / 日本語 / 한국어 / Español. Auto-detected from browser, switchable.
- **📑 Table of Contents** — Collapsible sidebar with chapter navigation.
- **🎬 Media-aware** — Inline `<audio>`/`<video>` with event links (click a timestamp → seek). Asset URLs rewritten to blob URLs on the fly so missing-manifest entries still work.
- **🖨 EPUB fixed-layout friendly** — Pre-paginated FXL EPUBs render at native aspect ratio with proper page breaks.
- **📱 Mobile-responsive UI** — Compact toolbar on phones, full toolbar on desktop.

## 🚀 Quick Start

```bash
# Requirements: Node.js 18.18+ (Next.js 16 requirement)
git clone https://github.com/yjyinfo/scenebox-reader.git
cd scenebox-reader
npm install
npm run dev
```

Open <http://localhost:3000> (Next auto-switches to 3001 if 3000 is busy), then:

- **Click anywhere** in the empty drop zone, **or**
- **Drag any `.epub` file** onto the page.

That's it. No backend, no upload, no telemetry.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/⌘ + Scroll` | Zoom in/out |
| `← / →` | Previous/next page pair (in Two Pages mode) |
| `Click 100%` | Reset zoom to auto-fit |
| `☰` | Toggle TOC sidebar |

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router) + **[React 19](https://react.dev/)**
- **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[JSZip 3](https://stuk.github.io/jszip/)** for in-browser EPUB parsing

No EPUB library — we wrote our own tiny parser (`lib/epub.ts`) that:
1. Reads `META-INF/container.xml` to find the OPF manifest
2. Parses metadata / spine / TOC
3. Rewrites every relative asset reference (`<img src>`, `<video src>`, `<a href>`...) to a blob URL extracted from the zip
4. Strips `<![CDATA[]]>` wrappers from inline `<script>` (HTML parsers choke on them — see `lib/epub.ts` for the war story)

Total custom parsing code: **~200 LOC**.

## 🌍 i18n

5 languages live in [`lib/i18n.ts`](lib/i18n.ts). Add a new language by:

1. Picking a 2-letter code (e.g. `fr`)
2. Adding a `fr: { ... }` block (copy from `en` and translate)
3. Adding it to the `LANGS` array
4. Adding `"fr"` to `detectLang()`'s prefix map

PRs welcome — see [Contributing](#-contributing).

## 🖨️ Print Architecture

Clicking the 🖨 button:

1. Merges all spine XHTML pages into one hidden iframe
2. Strips each page's `body { padding/margin }` (those are screen-only margin simulations, the printer has its own physical margins)
3. Scales content to fit A4 with a 10mm safe zone (avoids mechanical non-printable edges)
4. Calls `iframe.contentWindow.print()` — browser shows native dialog with full page-range control

The PDF you see in the browser's print preview (`chrome-untrusted://print/...`) is **generated by the browser**, not us. We only control the iframe's HTML/CSS; the browser does the rest.

## 🔒 Privacy

- No backend, no server, no API.
- File bytes are processed entirely by your browser's JSZip.
- No analytics, no cookies, no `localStorage` except user preferences (`theme`, `lang`).
- Safe to self-host on any static host (Vercel / Netlify / GitHub Pages / your own server).

## 🚢 Self-Hosting

### Vercel (recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker / Node
```bash
npm run build
npm start   # listens on $PORT or 3000
```

### Static export
This is a pure client-side app — set `output: 'export'` in `next.config.ts` and host the `out/` directory anywhere.

## 🤝 Contributing

PRs welcome. Especially valuable:

- 🌍 i18n translations for more languages
- 📚 Compatibility with more EPUB variants (reflowable text-heavy books, EPUB 2, etc.)
- 🎨 Theme presets (Sepia, High contrast, Dyslexia-friendly)
- ⌨️ More keyboard shortcuts
- ♿ Accessibility audit

Please run `npm run build` before submitting — it must pass TypeScript + lint.

## 📄 License

[Apache License 2.0](LICENSE) © SceneBox Reader Contributors
