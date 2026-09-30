# Plan de implementación

Fases pequeñas y en orden. Se trabaja directamente en `main`. Al terminar cada una: `npm run check && npm run build`, y la web desplegada en Cloudflare.

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

- [ ] Colección `lab` con imagen y vídeo, y dos piezas de ejemplo.
- [ ] Mosaico con filtros.
- [ ] Página de experimento: anterior y siguiente (también con flechas), copiar prompt, vídeo sin reproducción automática.
- [ ] View Transitions entre documentos, solo con CSS.

## Fase 4 · /uses

- [ ] `uses.yaml` con todas las secciones y sus textos entre corchetes.
- [ ] Filas, fichas técnicas, ilustración del teclado y tarjeta de café.
- [ ] Índice con sección activa (escritorio y móvil).

## Fase 5 · Portada estática

- [ ] `timeline.yaml` con los siete capítulos.
- [ ] Hero y capítulos **en vertical**, accesibles y completos sin JS. Esta es la versión base que ven quienes tienen movimiento reducido.
- [ ] Guiños visuales de cada época.

## Fase 6 · Portada interactiva

- [ ] Escritorio: scroll horizontal anclado, parallax, barra superior y menú inferior de capítulos.
- [ ] Móvil: capítulos a pantalla completa, barra superior con índice desplegable, zonas seguras.
- [ ] Easter egg del Código Konami.
- [ ] Medir: ≤ 20 KB de JS inicial y 60 fps al hacer scroll en un móvil medio.

## Fase 7 · Chat de la versión IA

- [ ] Interfaz del chat (cerrado y abierto) con respuestas simuladas.
- [ ] `/api/chat` con streaming, límites en KV y mensajes de error.
- [ ] Construcción del contexto. El `system-prompt.md` lo escribe el autor antes de esta fase.
- [ ] Tope de gasto configurado en la consola de Anthropic.
- [ ] Enlace "¿Te queda alguna duda? Pregúntale a mi versión IA" al final de cada nota (está en el artefacto; se añade cuando exista el chat).

## Fase 8 · Pulido y lanzamiento

- [ ] Contenido en inglés (con `/traducir`), `hreflang` y `x-default` revisados.
- [ ] Imágenes para compartir (Open Graph), favicon y `robots.txt`.
- [ ] Auditoría: Lighthouse ≥ 95, axe sin errores, navegación completa con teclado, lector de pantalla en portada y chat, movimiento reducido, iPhone real.
- [ ] Migración del dominio de Vercel a Cloudflare (primero DNS, después el registro) y archivar el repositorio antiguo.
