<div align="center">

# 📖 SceneBox Reader

**隐私优先的 EPUB 阅读器。100% 客户端运行。**

拖入 `.epub` 文件 → 开始阅读。你的文件永远不会离开浏览器。

📚 **Translations**: [English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español (Latinoamérica)](README.es.md)

[关于 SceneBox](#-关于-scenebox) · [功能特性](#-功能特性) · [快速开始](#-快速开始) · [键盘快捷键](#-键盘快捷键) · [技术栈](#-技术栈) · [参与贡献](#-参与贡献) · [许可证](#-许可证)

</div>

---

## 📦 关于 SceneBox

**SceneBox Reader** 是 **[SceneBox App](https://apps.apple.com/app/id6789491378)** 导出报告的配套阅读器。

> 现场发生了什么？问题到底出在哪里？有哪些证据？

SceneBox 帮助你完整记录这些答案，并把它们整理成任何人都能一目了然的报告。

它适用于设备安装、售后维修、物业交接、设施巡检、设备维护、项目验收、市政投诉等任何需要清晰现场记录的场景。

### SceneBox 能做什么

**🎯 一次拍摄，完整呈现** — 将文字、照片、视频、音频和位置整合在一起。不再让关键信息散落在相册、备忘录和聊天记录中。随时添加或重新排列条目，直到故事脉络清晰。

**✏️ 直接标注问题** — 在照片上添加箭头和文字，指出故障、损坏、安装位置或任何值得记录的内容。标注支持移动、缩放、旋转和改色，原图始终保留。

**⏱️ 精准定位关键时刻** — 当你听到异常声响或在音视频中发现了关键帧，在该时间点添加一个事件。后续回看时可直接跳回那个瞬间，无需从头拖动进度条。

**📶 离线拍摄，无需账号** — 无需注册。即使在地下室、机房、工地或任何网络不佳的地方，也能持续拍摄、录制、整理和预览。

SceneBox 将这些报告导出为标准 `.epub` 文件，而 **SceneBox Reader** 是在任何设备上阅读这些报告最简单的方式，无需安装任何软件。

> 💡 **SceneBox Reader 同时也是一款完全标准的 EPUB 阅读器** — 可以打开来自 Project Gutenberg、Standard Ebooks 或其他任何来源的 `.epub` 图书。

---

## ✨ 功能特性

- **🔒 100% 客户端运行** — 文件使用 `JSZip` 在本地解析，绝不上传到任何服务器。
- **📐 三种视图模式** — 单页连续 / 双页 / 双页连续。
- **🔍 智能缩放** — 移动端/平板自动适配，桌面端 100% 显示。使用 `Ctrl/⌘ + 滚轮` 可手动覆盖。
- **🖨️ 打印** — 将所有页面合并为单个 PDF，浏览器原生对话框支持页面范围选择。
- **🌗 系统深色模式** — 在 Windows/macOS/Linux/iOS/Android 上跟随系统主题。手动设置会被持久化保存。
- **🌍 5 种语言** — English / 中文 / 日本語 / 한국어 / Español。根据浏览器自动检测，可手动切换。
- **📑 目录** — 可折叠侧边栏，支持章节导航。
- **🎬 媒体感知** — 内联 `<audio>`/`<video>` 并带有事件链接（点击时间戳即可跳转）。资源 URL 会实时重写为 blob URL，即使清单中缺失的条目也能正常工作。
- **🖨 EPUB 固定版式友好** — 预分页的 FXL EPUB 以原始宽高比渲染，并带有正确的分页符。
- **📱 移动端响应式 UI** — 手机上显示紧凑工具栏，桌面端显示完整工具栏。

## 🚀 快速开始

```bash
# 环境要求：Node.js 18.18+（Next.js 16 的要求）
git clone https://github.com/yjyinfo/scenebox-reader.git
cd scenebox-reader
npm install
npm run dev
```

打开 <http://localhost:3000>（如果 3000 端口被占用，Next 会自动切换到 3001），然后：

- **点击**空白拖放区域的任意位置，**或者**
- **将任意 `.epub` 文件拖拽**到页面上。

就这样。没有后端，没有上传，没有遥测。

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|---|---|
| `Ctrl/⌘ + 滚动` | 放大/缩小 |
| `← / →` | 上一页/下一页（在双页模式下翻页） |
| `点击 100%` | 重置为自动适配缩放 |
| `☰` | 切换目录侧边栏 |

## 🛠️ 技术栈

- **[Next.js 16](https://nextjs.org/)**（App Router）+ **[React 19](https://react.dev/)**
- **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[JSZip 3](https://stuk.github.io/jszip/)** 用于在浏览器中解析 EPUB

没有使用任何 EPUB 库 — 我们自己写了一个极简解析器（`lib/epub.ts`），它会：
1. 读取 `META-INF/container.xml` 来找到 OPF 清单
2. 解析元数据 / spine / 目录
3. 将每个相对资源引用（`<img src>`、`<video src>`、`<a href>` 等）重写为从 zip 中提取的 blob URL
4. 从内联 `<script>` 中剥离 `<![CDATA[]]>` 包裹（HTML 解析器会在这里卡住 — 详见 `lib/epub.ts` 中的踩坑记录）

自定义解析代码总计：**约 200 行**。

## 🌍 国际化

5 种语言位于 [`lib/i18n.ts`](lib/i18n.ts)。添加新语言的方法：

1. 选一个两字母代码（例如 `fr`）
2. 添加一个 `fr: { ... }` 代码块（从 `en` 复制并翻译）
3. 将其添加到 `LANGS` 数组中
4. 在 `detectLang()` 的前缀映射中添加 `"fr"`

欢迎提交 PR — 详见[参与贡献](#-参与贡献)。

## 🖨️ 打印架构

点击 🖨 按钮：

1. 将所有 spine XHTML 页面合并到一个隐藏的 iframe 中
2. 去除每个页面的 `body { padding/margin }`（那些是仅用于屏幕显示的外边距模拟，打印机有自己的物理边距）
3. 将内容缩放以适配 A4 纸，并保留 10mm 的安全区（避开机械性不可打印边缘）
4. 调用 `iframe.contentWindow.print()` — 浏览器会显示原生对话框，支持完整的页面范围控制

你在浏览器打印预览中看到的 PDF（`chrome-untrusted://print/...`）是**由浏览器生成的**，而非我们。我们只控制 iframe 的 HTML/CSS，其余由浏览器完成。

## 🔒 隐私

- 没有后端，没有服务器，没有 API。
- 文件字节完全由你浏览器中的 JSZip 处理。
- 没有分析统计，没有 Cookie，除了用户偏好（`theme`、`lang`）外不使用 `localStorage`。
- 可安全地自部署在任何静态托管平台上（Vercel / Netlify / GitHub Pages / 你自己的服务器）。

## 🚢 自部署

### Vercel（推荐）
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker / Node
```bash
npm run build
npm start   # 监听 $PORT 或 3000 端口
```

### 静态导出
这是一个纯客户端应用 — 在 `next.config.ts` 中设置 `output: 'export'`，然后将 `out/` 目录托管到任何地方即可。

## 🤝 参与贡献

欢迎提交 PR。以下方面尤其有价值：

- 🌍 更多语言的国际化翻译
- 📚 对更多 EPUB 变体的兼容性（可重排的纯文本图书、EPUB 2 等）
- 🎨 主题预设（护眼黄、高对比度、阅读障碍友好）
- ⌨️ 更多键盘快捷键
- ♿ 无障碍审计

提交前请运行 `npm run build` — 必须通过 TypeScript + lint 检查。

## 📄 许可证

[Apache License 2.0](LICENSE) © SceneBox Reader Contributors
