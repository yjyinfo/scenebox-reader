export type Lang = "zh" | "en" | "ja" | "ko" | "es";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "es", label: "Español (Latinoamérica)", flag: "🇲🇽" },
];

type Dict = Record<string, string>;

const zh: Dict = {
  toggleSidebar: "切换目录",
  toggleSidebarTitle: "切换目录侧栏",
  product: "SceneBox Reader",
  toggleTheme: "切换暗黑模式",
  toLight: "切到亮色",
  toDark: "切到暗色",
  openFile: "打开文件（或拖入主区域）",
  zoomIn: "放大",
  zoomOut: "缩小",
  zoomReset: "原始尺寸",
  viewSingle: "单页连续",
  viewDouble: "双页",
  viewDoubleScroll: "双页连续",
  print: "打印（在对话框中选范围）",
  toc: "目录",
  noToc: "本书无目录",
  openToShow: "打开文件后显示章节",
  noTitle: "(无标题)",
  prevPage: "上一页",
  nextPage: "下一页",
  keyboardHint: "← / → 翻页",
  parsing: "解析中…",
  placeholderHint: "点击此处或拖入 .epub 文件开始阅读。",
  privacy: "文件仅在本地浏览器中解析，不会上传到任何服务器。",
  fileTypeError: "请拖入 .epub 格式的文件",
  parseError: "无法解析此 EPUB 文件",
  langLabel: "语言",
};

const en: Dict = {
  toggleSidebar: "Toggle Sidebar",
  toggleSidebarTitle: "Toggle sidebar",
  product: "SceneBox Reader",
  toggleTheme: "Toggle Dark Mode",
  toLight: "Switch to Light",
  toDark: "Switch to Dark",
  openFile: "Open file (or drag into main area)",
  zoomIn: "Zoom In",
  zoomOut: "Zoom Out",
  zoomReset: "Original Size",
  viewSingle: "Single Page",
  viewDouble: "Two Pages",
  viewDoubleScroll: "Two Pages Continuous",
  print: "Print (select range in dialog)",
  toc: "Contents",
  noToc: "No table of contents",
  openToShow: "Open a file to see chapters",
  noTitle: "(Untitled)",
  prevPage: "Previous",
  nextPage: "Next",
  keyboardHint: "← / → to turn pages",
  parsing: "Parsing…",
  placeholderHint: "Click here or drop an .epub file to start reading.",
  privacy: "Files are parsed locally in your browser and never uploaded.",
  fileTypeError: "Please drop an .epub file",
  parseError: "Failed to parse this EPUB file",
  langLabel: "Language",
};

const ja: Dict = {
  toggleSidebar: "サイドバー切替",
  toggleSidebarTitle: "目次サイドバー切替",
  product: "SceneBox Reader",
  toggleTheme: "ダークモード切替",
  toLight: "ライトに切替",
  toDark: "ダークに切替",
  openFile: "ファイルを開く（メインエリアにドラッグ）",
  zoomIn: "拡大",
  zoomOut: "縮小",
  zoomReset: "元のサイズ",
  viewSingle: "単ページ連続",
  viewDouble: "見開き",
  viewDoubleScroll: "見開き連続",
  print: "印刷（ダイアログで範囲選択）",
  toc: "目次",
  noToc: "目次がありません",
  openToShow: "ファイルを開くと章が表示されます",
  noTitle: "(無題)",
  prevPage: "前のページ",
  nextPage: "次のページ",
  keyboardHint: "← / → でページめくり",
  parsing: "解析中…",
  placeholderHint: "ここをクリック、または .epub ファイルをドロップ。",
  privacy: "ファイルはブラウザ内でローカル解析され、アップロードされません。",
  fileTypeError: ".epub 形式のファイルをドロップしてください",
  parseError: "この EPUB ファイルを解析できません",
  langLabel: "言語",
};

const ko: Dict = {
  toggleSidebar: "사이드바 전환",
  toggleSidebarTitle: "목차 사이드바 전환",
  product: "SceneBox Reader",
  toggleTheme: "다크 모드 전환",
  toLight: "라이트로 전환",
  toDark: "다크로 전환",
  openFile: "파일 열기 (메인 영역에 드래그)",
  zoomIn: "확대",
  zoomOut: "축소",
  zoomReset: "원래 크기",
  viewSingle: "단면 연속",
  viewDouble: "양면",
  viewDoubleScroll: "양면 연속",
  print: "인쇄 (대화상자에서 범위 선택)",
  toc: "목차",
  noToc: "목차가 없습니다",
  openToShow: "파일을 열면 챕터가 표시됩니다",
  noTitle: "(제목 없음)",
  prevPage: "이전 페이지",
  nextPage: "다음 페이지",
  keyboardHint: "← / → 페이지 넘기기",
  parsing: "파싱 중…",
  placeholderHint: "여기를 클릭하거나 .epub 파일을 드롭하세요.",
  privacy: "파일은 브라우저에서 로컬로 파싱되며 업로드되지 않습니다.",
  fileTypeError: ".epub 형식의 파일을 드롭하세요",
  parseError: "이 EPUB 파일을 파싱할 수 없습니다",
  langLabel: "언어",
};

const es: Dict = {
  toggleSidebar: "Alternar barra lateral",
  toggleSidebarTitle: "Alternar barra de índice",
  product: "SceneBox Reader",
  toggleTheme: "Alternar modo oscuro",
  toLight: "Cambiar a claro",
  toDark: "Cambiar a oscuro",
  openFile: "Abrir archivo (o arrastrar al área principal)",
  zoomIn: "Acercar",
  zoomOut: "Alejar",
  zoomReset: "Tamaño original",
  viewSingle: "Página simple continua",
  viewDouble: "Doble página",
  viewDoubleScroll: "Doble página continua",
  print: "Imprimir (selecciona rango en el diálogo)",
  toc: "Índice",
  noToc: "Sin índice",
  openToShow: "Abre un archivo para ver los capítulos",
  noTitle: "(Sin título)",
  prevPage: "Anterior",
  nextPage: "Siguiente",
  keyboardHint: "← / → para pasar páginas",
  parsing: "Procesando…",
  placeholderHint: "Haz clic aquí o arrastra un archivo .epub para empezar.",
  privacy: "Los archivos se procesan localmente en tu navegador, sin subirse.",
  fileTypeError: "Por favor, arrastra un archivo .epub",
  parseError: "No se pudo analizar este archivo EPUB",
  langLabel: "Idioma",
};

const DICTS: Record<Lang, Dict> = { zh, en, ja, ko, es };

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "zh";
  const nav = navigator.language?.toLowerCase() ?? "zh";
  if (nav.startsWith("zh")) return "zh";
  if (nav.startsWith("ja")) return "ja";
  if (nav.startsWith("ko")) return "ko";
  if (nav.startsWith("es")) return "es";
  return "en";
}

export function translate(lang: Lang, key: string): string {
  return DICTS[lang]?.[key] ?? DICTS.en[key] ?? DICTS.zh[key] ?? key;
}
