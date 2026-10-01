# Plan de implementación

Fases pequeñas y en orden. Se trabaja directamente en `main`. Al terminar cada una: `npm run check && npm run build`, y la web desplegada en Cloudflare.

**Estado (30.09.2026):** el código de las fases 0 a 8 está hecho. Lo que queda depende del autor y está en la lista siguiente.

## Pendiente del autor

Contenido (buscar `[` en los archivos):

- [ ] Email del pie en `src/data/links.ts` (ahora `[email]`). Recomendado: un alias como `hola@klykov.me` con Cloudflare Email Routing, cuando el dominio esté en Cloudflare, para no publicar el correo personal. También aparece en los errores del chat.
- [ ] Años de la línea temporal (`[año]`) en `src/data/timeline.yaml`.
- [ ] `/uses`: modelos, porqués, receta del café y fechas en `src/data/uses.yaml`. Las traducciones que faltan están marcadas como `[traducción]`: se pueden generar con `/traducir` cuando el español esté escrito.
- [ ] Nota de ejemplo: revisar el texto (sale del artefacto) y su versión en inglés `en.md`.
- [ ] Revisar los textos de interfaz en inglés de `src/i18n/ui.ts` (los traduje yo) y las traducciones de la línea temporal y /uses.
- [x] Piezas iniciales del Lab (`estudio-de-luz`, `horizonte-caramelo`, generadas con código) completadas sin marcadores. Opcional: añadir o sustituir por experimentos reales con `/nuevo-experimento`.

Chat de la versión IA:

- [ ] Completar `src/ai/system-prompt.md` (borrador con las reglas de `docs/chat-ia.md`) y `src/ai/cv.md` (solo marcadores, solo datos públicos).
- [ ] Secreto `ANTHROPIC_API_KEY` en el Worker `klykov-me` de Cloudflare (Settings → Variables and Secrets). Sin él, el chat responde "Ahora mismo no puedo responder".
- [ ] Tope de gasto mensual en la consola de Anthropic.
- [ ] Comprobar en el primer despliegue que Wrangler ha creado la KV `RATE_LIMIT`. Si el despliegue falla por la KV: créala en Cloudflare (Storage & Databases → KV) y pon su `id` en `wrangler.jsonc`.

Revisión en dispositivos reales:

- [ ] iPhone real: portada (capítulos, índice, zonas seguras), chat y 60 fps al hacer scroll.
- [ ] Lector de pantalla (VoiceOver o NVDA) en la portada y en el chat.

Lanzamiento:

- [ ] Migración del dominio de Vercel a Cloudflare (primero DNS, después el registro) y dominio personalizado `klykov.me` en el Worker.
- [ ] Archivar el repositorio antiguo.
- [ ] Opcional: cambiar el favicon (`public/favicon.ico`, `public/apple-touch-icon.png`) y las imágenes para compartir (`public/og/`) si no convencen; no están en el artefacto.

## Fase 0 · Base del proyecto

- [x] Crear el proyecto Astro 7 en la raíz del repo (plantilla mínima, TypeScript estricto). Conservar `CLAUDE.md`, `docs/` y `.claude/`.
- [x] `@astrojs/cloudflare` con `output: 'static'` (todo prerenderizado).
- [x] i18n: `defaultLocale: 'es'`, `locales: ['es', 'en']`, rutas con prefijo en ambos idiomas; `/` redirige a `/es/`.
- [x] `tokens.css` con los colores, tipografías y espaciados del artefacto de diseño, y `global.css` (reset mínimo, tipografía base, foco visible, `prefers-reduced-motion`).
- [x] Fuentes autoalojadas en woff2 (Instrument Serif; IBM Plex Sans y Mono 400 y 500).
- [x] `layouts/Base.astro`: `lang`, meta, `hreflang`, `viewport-fit=cover`, canónica.
- [x] Conectar el repo a Cloudflare y comprobar el despliegue (https://klykov-me.kklykov.workers.dev).

**Hecho cuando:** `/es/` y `/en/` muestran una página vacía con las fuentes y los colores correctos, desplegada en Cloudflare.

## Fase 1 · Cabecera, pie y páginas vacías

- [x] `Header` y `Footer` según el artefacto de diseño y `docs/diseno.md`, con selector de idioma.
- [x] Páginas vacías: portada, notas, lab, uses y 404, en ambos idiomas.
- [x] Textos de interfaz en `src/i18n/`.

## Fase 2 · Notas

- [x] Colección `notas` con su esquema (ver `docs/contenido.md`) y una nota de ejemplo.
- [x] Listado con filtros como mejora progresiva.
- [x] Página de nota: diseño de lectura, Shiki con tema propio, copiar código y copiar enlace, barra de progreso solo con CSS, siguiente nota.
- [x] Tiempo de lectura, RSS y sitemap.

## Fase 3 · Lab

- [x] Colección `lab` con imagen y vídeo, y dos piezas iniciales generadas con código.
- [x] Mosaico con filtros.
- [x] Página de experimento: anterior y siguiente (también con flechas), copiar prompt, vídeo sin reproducción automática.
- [x] View Transitions entre documentos, solo con CSS.

## Fase 4 · /uses

- [x] `uses.yaml` con todas las secciones y sus textos entre corchetes.
- [x] Filas, fichas técnicas, ilustración del teclado y tarjeta de café.
- [x] Índice con sección activa (escritorio y móvil).

## Fase 5 · Portada estática

- [x] `timeline.yaml` con los siete capítulos.
- [x] Hero y capítulos **en vertical**, accesibles y completos sin JS. Esta es la versión base que ven quienes tienen movimiento reducido.
- [x] Guiños visuales de cada época.

## Fase 6 · Portada interactiva

- [x] Escritorio: scroll horizontal anclado, parallax, barra superior y menú inferior de capítulos.
- [x] Móvil: capítulos a pantalla completa, barra superior con índice desplegable, zonas seguras.
- [x] Easter egg del Código Konami.
- [x] Medir: ≤ 20 KB de JS inicial y 60 fps al hacer scroll. (2,5 KB gzip con el arranque del chat; sin fotogramas largos en Edge con CPU ×4. Falta el móvil real: ver "Pendiente del autor".)

## Fase 7 · Chat de la versión IA

- [x] Interfaz del chat (cerrado y abierto) con respuestas simuladas (en `npm run dev` sin clave).
- [x] `/api/chat` con streaming, límites en KV y mensajes de error.
- [x] Construcción del contexto (CV, notas en español y /uses, con prompt caching).
- [x] Enlace "¿Te queda alguna duda? Pregúntale a mi versión IA" al final de cada nota.
- El `system-prompt.md`, el CV, la clave y el tope de gasto están en "Pendiente del autor".

## Fase 8 · Pulido y lanzamiento

- [x] Contenido en inglés (con `/traducir`): nota de ejemplo (`/en/notes/useful-over-pretty/`), línea temporal y /uses. `hreflang` y `x-default` revisados: solo se anuncian los idiomas que existen.
- [x] Imágenes para compartir (Open Graph, una por idioma), favicon y `robots.txt`.
- [x] Auditoría automática (30.09.2026, build de producción):
  - Lighthouse móvil: 100 en las cuatro categorías en portada, notas, nota, Lab, experimentos y portada en inglés; /uses 99/100/100/100.
  - axe (WCAG 2.2 AA y buenas prácticas), escritorio y móvil: sin errores. Única excepción, esperada: en la portada horizontal de escritorio, los capítulos fuera de pantalla están al 10 % de opacidad (diseño) y axe marca su contraste.
  - Teclado: todo el recorrido con Tab es visible y con foco; en la portada horizontal, el foco lleva al capítulo.
  - Movimiento reducido: la portada pasa a vertical, sin parallax ni animaciones.
- Revisión en dispositivos reales y lanzamiento: ver "Pendiente del autor".
