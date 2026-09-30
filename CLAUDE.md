# klykov.me

Web personal de Klykov: marca personal, espacio artístico y carta de presentación por si algún día busco trabajo. **No** vende servicios (eso es klykov.co, otro proyecto).

**Principio rector: lo útil por encima de lo bonito.** La propia web tiene que demostrarlo en UX, DX, rendimiento y accesibilidad. Ante la duda, elige la opción más simple y con menos mantenimiento: el autor tiene muy poco tiempo.

## Stack

- **Astro 7** (Node ≥ 22.12) con TypeScript estricto.
- **CSS propio** con variables (`src/styles/tokens.css`). Sin Tailwind ni librerías de UI.
- **JS vanilla** en `<script>` de componentes Astro. Sin React/Vue/Svelte. Sin librerías de animación (nada de GSAP, Lenis, etc.).
- **Contenido:** colecciones de contenido de Astro (Markdown y YAML) validadas con esquemas zod (`import { z } from 'astro/zod'`).
- **Imágenes:** `astro:assets` (`<Image>` / `<Picture>`), salida AVIF y WebP.
- **Hosting:** Cloudflare con `@astrojs/cloudflare`. Todo prerenderizado excepto `/api/chat`.
- **IA:** API de Claude, llamada solo desde `src/pages/api/chat.ts`.

No añadas dependencias sin justificarlo en el commit: cada dependencia es mantenimiento.

## Comandos

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run preview`: previsualizar el build
- `npm run check`: `astro check` (tipos y contenido)

La redirección de `/` a `/es/` está en `redirects` de `astro.config.mjs` (Cloudflare la sirve como 301 desde `_redirects`).

Antes de dar una tarea por terminada: `npm run check && npm run build` sin errores ni avisos.

## Estructura

```
src/
├── content.config.ts        # colecciones y esquemas
├── content/
│   ├── notas/<slug>/es.md   # una carpeta por nota, un archivo por idioma
│   └── lab/<slug>/es.md     # + imagen/vídeo junto al .md
├── data/
│   ├── links.ts             # enlaces del pie (email, GitHub, LinkedIn…)
│   ├── timeline.yaml        # capítulos de la portada
│   └── uses.yaml            # contenido de /uses
├── ai/
│   ├── cv.md                # CV público (sin datos privados)
│   └── system-prompt.md     # system prompt de la versión IA
├── i18n/                    # idiomas (config.ts), rutas por idioma (routes.ts), textos de interfaz (ui.ts)
├── lib/                     # notes.ts, lab.ts, uses.ts (carga de cada colección), content.ts (común), format.ts (fechas), code.ts (Shiki)
├── styles/                  # tokens.css, global.css, prose.css (Markdown), lab.css (View Transitions), fonts/
├── layouts/Base.astro
├── components/              # Header, Footer, LangSwitch, PageHeader, Filters, EmptyList, Keyboard, Timeline/* (Hero, Timeline, Chapter, Wink, Outro), Chat/*, …
└── pages/
    ├── [lang]/…             # portada, [notes] (listado, [slug], rss.xml), lab (listado, [slug]), uses y 404
    └── api/chat.ts          # único endpoint dinámico
```

- Las URLs se construyen siempre con `homeUrl` y `sectionUrl` de `src/i18n/routes.ts`; nunca a mano.
- La 404 se genera por idioma y el build la mueve a `/404.html` y `/en/404.html` (integración en `astro.config.mjs`); Cloudflare sirve la más cercana a la URL pedida.

## Fuentes de la verdad

Cada cosa vive en un solo sitio. No copies su contenido a otros archivos: consúltalo.

- **Diseño visual:** el artefacto de diseño, https://claude.ai/artifact/U6cyBdr6Z4hZXBbfLhdEcT (página "Diseño"; ignora la página "Descartadas"). Medidas, colores, tipografías, textos y comportamiento visual salen de ahí. Las maquetas usan estilos en línea y lógica de simulación: **no copies su código**, reimpleméntalo con componentes Astro, tokens y CSS propio.
- **Plan:** `docs/plan.md`. Sigue el orden de las fases y marca cada tarea como hecha en el mismo commit que la completa.
- **Reglas de comportamiento** que el lienzo no expresa (accesibilidad, movimiento reducido, versión sin JS, lógica de los componentes interactivos): `docs/diseno.md`.
- **Contenido:** `docs/contenido.md`.
- **Chat IA:** `docs/chat-ia.md`.

Si el artefacto y `docs/diseno.md` se contradicen, el artefacto manda en lo visual y `docs/diseno.md` en accesibilidad, rendimiento y comportamiento. Si falta algo en ambos, pregunta.

## Reglas de diseño

- Modo oscuro único, sin selector de tema. Extrae los colores del artefacto a `src/styles/tokens.css` en la Fase 0; a partir de ahí, **nunca** escribas un color a mano en el código: usa los tokens.
- Un solo color de acento: caramelo `#C8874F` (`--accent`).
- Tipografías: Instrument Serif (titulares), IBM Plex Sans (texto), IBM Plex Mono (metadatos y código). Autoalojadas.
- El "wow" vive **solo en la portada**. El resto de páginas son sobrias.
- Animaciones solo si dirigen la atención o son el momento artístico de la línea temporal. Solo `transform` y `opacity`.
- `prefers-reduced-motion: reduce` → sin parallax, sin transiciones y línea temporal en vertical.
- Todo el contenido debe ser accesible y legible **sin JavaScript**. El JS mejora, no habilita.

## Accesibilidad (no negociable)

HTML semántico y landmarks, un solo `h1` por página, foco visible, zonas táctiles ≥ 44 px, contraste AA, todo usable con teclado, `alt` en todas las imágenes, `lang` y `hreflang` correctos, `aria-live` solo donde se anuncia algo (chat y easter egg).

## Rendimiento (presupuesto)

- Notas, Lab y /uses: sin JS salvo mejoras mínimas (< 2 KB en total: filtros, copiar enlace, índice activo).
- Portada: ≤ 20 KB de JS inicial (gzip). El chat se carga con `import()` al pulsar su enlace.
- Fuentes woff2 con subset latino; `preload` solo de Instrument Serif; `font-display: swap`.
- Imágenes siempre con `width` y `height`.
- Objetivo: Lighthouse ≥ 95 en las cuatro categorías en todas las páginas.

## Idiomas

- Español por defecto. Rutas `/es/…` y `/en/…`, con `hreflang` y `x-default`.
- Textos de interfaz en `src/i18n/`. El contenido va en `es.md` / `en.md` dentro de la carpeta de cada pieza.
- Si falta `en.md`, la pieza solo existe en español. **Nunca** inventes una traducción que no esté en el repositorio.

## Contenido y datos personales

- Los textos entre corchetes (`[año]`, `[modelo]`, `[email]`…) los rellena el autor. **No inventes** fechas, empleos, modelos de hardware, recetas ni opiniones.
- Nada privado en el repositorio: es público.
- La clave de la API solo existe como secreto de Cloudflare (`ANTHROPIC_API_KEY`). Jamás en el código, en `.env` versionado ni en el cliente.

## Forma de trabajar

- Se trabaja directamente en `main`, sin ramas ni PRs: cada push despliega en producción. Commits pequeños, y nunca un push con `npm run check && npm run build` fallando.
- Mensajes de commit en inglés con Conventional Commits (`feat:`, `fix:`, `docs:`…).
- Si algo no está en el artefacto de diseño ni en `docs/diseno.md`, pregunta antes de inventar diseño.
- Si una decisión del plan complica el proyecto sin necesidad, dilo y propón la alternativa simple.
