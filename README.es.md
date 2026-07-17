<div align="center">

# 📖 SceneBox Reader

**Lector de EPUB centrado en la privacidad. 100% del lado del cliente.**

Suelta un archivo `.epub` → léelo. Tu archivo nunca sale del navegador.

📚 **Translations**: [English](README.md) | [中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Español (Latinoamérica)](README.es.md)

[Acerca de SceneBox](#-about-scenebox) · [Funciones](#-features) · [Inicio rápido](#-quick-start) · [Atajos de teclado](#-keyboard-shortcuts) · [Stack técnico](#-tech-stack) · [Contribuir](#-contributing) · [Licencia](#-license)

</div>

---

## 📦 Acerca de SceneBox

**SceneBox Reader** es el lector complementario para los informes exportados por la **[SceneBox App](https://apps.apple.com/app/id6789491378)**.

> ¿Qué ocurrió en el lugar? ¿Dónde está exactamente el problema? ¿Qué evidencia había?

SceneBox te ayuda a capturar estas respuestas de forma completa y convertirlas en un informe que cualquiera puede entender de un vistazo.

Está diseñado para instalaciones, reparaciones en postventa, entrega de propiedades, inspección de instalaciones, mantenimiento de equipos, recepción de obras, quejas municipales — cualquier momento en el que necesites un registro claro del sitio.

### Qué hace SceneBox

**🎯 Una captura, panorama completo** — Combina texto, fotos, videos, audio y ubicación en un solo lugar. Deja de esparcir información clave entre álbumes de fotos, apps de notas e historiales de chat. Agrega o reordena entradas en cualquier momento hasta que la historia quede clara.

**✏️ Anota el problema directamente** — Agrega flechas y texto sobre las fotos para señalar fallas, daños, ubicaciones de instalación o cualquier cosa que valga la pena destacar. Las anotaciones se pueden mover, cambiar de tamaño, rotar y recolorear. La foto original siempre se conserva.

**⏱️ Fija el momento exacto** — Cuando escuches un sonido anormal o detectes un fotograma clave en el audio/video, agrega un evento en esa marca de tiempo. Revisarlo después te lleva directamente al momento — sin rebobinar desde el principio.

**📶 Captura sin conexión, sin cuenta** — No requiere registro. Sigue tomando fotos, grabando, organizando y previsualizando incluso en sótanos, cuartos de servidores, obras o donde sea que falle la red.

SceneBox exporta estos informes como archivos `.epub` estándar — y **SceneBox Reader** es la forma más sencilla de leerlos en cualquier dispositivo, sin instalar nada.

> 💡 **SceneBox Reader también es un lector de EPUB completamente estándar** — abre cualquier libro `.epub` de Project Gutenberg, Standard Ebooks o de cualquier otro lugar.

---

## ✨ Funciones

- **🔒 100% del lado del cliente** — Los archivos se procesan localmente con `JSZip`, nunca se suben a ningún servidor.
- **📐 Tres modos de visualización** — Página única continua / Dos páginas / Dos páginas continuas.
- **🔍 Zoom inteligente** — Autoajuste en celular/tablet, 100% en computadora. `Ctrl/⌘ + rueda` para anularlo.
- **🖨️ Imprimir** — Combina todas las páginas en un solo PDF, diálogo nativo del navegador con selección de rango de páginas.
- **🌗 Modo oscuro del sistema** — Sigue el tema del sistema operativo en Windows/macOS/Linux/iOS/Android. La anulación manual se conserva.
- **🌍 5 idiomas** — English / 中文 / 日本語 / 한국어 / Español. Detección automática desde el navegador, conmutación manual.
- **📑 Tabla de contenidos** — Barra lateral plegable con navegación por capítulos.
- **🎬 Compatible con multimedia** — `<audio>`/`<video>` integrados con enlaces a eventos (clic en una marca de tiempo → salto). Las URLs de recursos se reescriben al vuelo a URLs blob para que las entradas ausentes del manifiesto también funcionen.
- **🖨 Compatible con EPUB de diseño fijo** — Los EPUB FXL pre-paginados se renderizan con su relación de aspecto nativa y saltos de página correctos.
- **📱 Interaz adaptable a móviles** — Barra de herramientas compacta en celulares, completa en computadora.

## 🚀 Inicio rápido

```bash
# Requisitos: Node.js 18.18+ (requisito de Next.js 16)
git clone https://github.com/yjyinfo/scenebox-reader.git
cd scenebox-reader
npm install
npm run dev
```

Abre <http://localhost:3000> (Next cambia automáticamente a 3001 si 3000 está ocupado), luego:

- **Haz clic en cualquier lugar** de la zona de soltar vacía, **o**
- **Arrastra cualquier archivo `.epub`** a la página.

Eso es todo. Sin backend, sin subidas, sin telemetría.

## ⌨️ Atajos de teclado

| Atajo | Acción |
|---|---|
| `Ctrl/⌘ + Rueda` | Acercar/alejar |
| `← / →` | Par de página anterior/siguiente (en modo Dos Páginas) |
| `Clic en 100%` | Restablecer zoom a autoajuste |
| `☰` | Mostrar/ocultar la barra lateral de contenidos |

## 🛠️ Stack técnico

- **[Next.js 16](https://nextjs.org/)** (App Router) + **[React 19](https://react.dev/)**
- **[TypeScript 5](https://www.typescriptlang.org/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[JSZip 3](https://stuk.github.io/jszip/)** para el procesamiento de EPUB en el navegador

Sin librería de EPUB — escribimos nuestro propio parser minimalista (`lib/epub.ts`) que:
1. Lee `META-INF/container.xml` para encontrar el manifiesto OPF
2. Procesa metadatos / spine / tabla de contenidos
3. Reescribe cada referencia relativa de recursos (`<img src>`, `<video src>`, `<a href>`...) a una URL blob extraída del zip
4. Elimina los envoltorios `<![CDATA[]]>` de los `<script>` integrados (los parsers de HTML se atragantan con ellos — ver `lib/epub.ts` para la historia completa)

Código total de parsing personalizado: **~200 LOC**.

## 🌍 i18n

5 idiomas en [`lib/i18n.ts`](lib/i18n.ts). Agrega un nuevo idioma así:

1. Elige un código de 2 letras (p. ej. `fr`)
2. Agrega un bloque `fr: { ... }` (copia de `en` y traduce)
3. Agrégalo al arreglo `LANGS`
4. Agrega `"fr"` al mapa de prefijos de `detectLang()`

Las PR son bienvenidas — ver [Contribuir](#-contributing).

## 🖨️ Arquitectura de impresión

Al hacer clic en el botón 🖨:

1. Fusiona todas las páginas XHTML del spine en un iframe oculto
2. Elimina el `body { padding/margin }` de cada página (esos son márgenes simulados solo para pantalla; la impresora tiene sus propios márgenes físicos)
3. Escala el contenido para ajustarlo a A4 con una zona segura de 10mm (evita los bordes mecánicos no imprimibles)
4. Llama a `iframe.contentWindow.print()` — el navegador muestra el diálogo nativo con control completo del rango de páginas

El PDF que ves en la vista previa de impresión del navegador (`chrome-untrusted://print/...`) está **generado por el navegador**, no por nosotros. Solo controlamos el HTML/CSS del iframe; el navegador hace el resto.

## 🔒 Privacidad

- Sin backend, sin servidor, sin API.
- Los bytes del archivo los procesa únicamente el JSZip de tu navegador.
- Sin analítica, sin cookies, sin `localStorage` salvo preferencias del usuario (`theme`, `lang`).
- Seguro de autohospedar en cualquier host estático (Vercel / Netlify / GitHub Pages / tu propio servidor).

## 🚢 Autohospedaje

### Vercel (recomendado)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Docker / Node
```bash
npm run build
npm start   # escucha en $PORT o 3000
```

### Exportación estática
Esta es una app puramente del lado del cliente — define `output: 'export'` en `next.config.ts` y hospeda el directorio `out/` donde quieras.

## 🤝 Contribuir

Las PR son bienvenidas. Especialmente valiosas:

- 🌍 Traducciones de i18n para más idiomas
- 📚 Compatibilidad con más variantes de EPUB (libros de texto reflujables, EPUB 2, etc.)
- 🎨 Preajustes de tema (Sepia, Alto contraste, Friendly para dislexia)
- ⌨️ Más atajos de teclado
- ♿ Auditoría de accesibilidad

Por favor ejecuta `npm run build` antes de enviar — debe pasar TypeScript + lint.

## 📄 Licencia

[Apache License 2.0](LICENSE) © SceneBox Reader Contributors
