# Contenido

Todo el contenido vive en el repositorio como Markdown o YAML. Publicar es escribir un archivo y hacer `git push`.

## Principios

- **Una carpeta por pieza, un archivo por idioma.** Los recursos (imágenes, vídeos) van dentro de la carpeta y los comparten ambos idiomas.
- **Español primero.** `es.md` es obligatorio; `en.md` es opcional. Si no existe, la pieza solo se publica en español.
- **Esquemas estrictos.** Si falta un campo o una etiqueta no es válida, el build falla. Mejor fallar en local que publicar algo roto.

## Notas

```
src/content/notas/lo-util-por-encima-de-lo-bonito/
├── es.md
├── en.md
└── esquema.png        # opcional
```

```markdown
---
title: Lo útil por encima de lo bonito
description: Por qué una interfaz bonita que no ayuda es solo decoración.
date: 2026-10-01
tags: [UX, DX]
draft: false
---

Llevo más de diez años haciendo web y…
```

En `en.md`, además, `slug` opcional para una URL en inglés (`useful-over-pretty`). Si no se indica, se usa el nombre de la carpeta.

Esquema orientativo:

```ts
const notas = defineCollection({
  loader: glob({ pattern: '*/{es,en}.md', base: './src/content/notas' }),
  schema: ({ image }) => z.object({
    title: z.string().max(90),
    description: z.string().max(160),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    tags: z.array(z.enum(['UX', 'DX', 'IA', 'Arte', 'Proyecto'])).min(1),
    slug: z.string().optional(),
    cover: image().optional(),
    draft: z.boolean().default(false),
  }),
});
```

- El idioma se deduce del nombre del archivo; la clave de traducción, del nombre de la carpeta.
- Tiempo de lectura calculado en el build (≈ 220 palabras por minuto).
- Los proyectos son notas con la etiqueta `Proyecto`.
- `draft: true` se ve en desarrollo y no se publica.
- El primer párrafo del cuerpo es la entradilla: se muestra más grande y en gris, bajo el título. `description` se usa en el listado, el RSS y los metadatos.
- Bloques de código con nombre de archivo: ` ```js title="regla.js" `. Sin `title`, la cabecera del bloque muestra el lenguaje.
- URLs: `/es/notas/<carpeta>/` y `/en/notes/<slug o carpeta>/`.

## Lab

```
src/content/lab/estudio-de-luz/
├── es.md
├── en.md
└── imagen.jpg         # o video.mp4 + video.webm + poster.jpg
```

```markdown
---
title: Estudio de luz
date: 2026-10-01
type: imagen
tool: "[herramienta]"
media: ./imagen.jpg
alt: Círculos concéntricos de luz caramelo sobre fondo oscuro
prompt: "[prompt completo]"
---

[Qué aprendí: dos o tres frases.]
```

Para vídeo:

```yaml
type: video
media: ./video.mp4
webm: ./video.webm
poster: ./poster.jpg
duration: 8
```

- El cuerpo del Markdown es el apartado "Qué aprendí".
- `alt` es obligatorio: describe lo que se ve, no el prompt.
- El orden (y los botones Anterior/Siguiente) va por fecha, del más reciente al más antiguo.

### Imágenes y vídeos

- **Imágenes:** sube el original en JPG o PNG (máximo unos 2400px de lado). Astro genera AVIF y WebP en varios tamaños.
- **Vídeos:** bucles cortos (≤ 10 s), en MP4 (H.264) y WebM, sin audio, con imagen de portada. Objetivo: ≤ 5 MB por archivo. Cloudflare no sirve archivos estáticos de más de 25 MiB; si algún vídeo lo necesita, va a R2 y en `media` se pone su URL.

## Línea temporal

`src/data/timeline.yaml`, siete capítulos con este formato:

```yaml
- id: "02"
  code: "$(02)"
  font: verdana
  year: "[año]"
  title: { es: jQuery, en: jQuery }
  text:
    es: El DOM por fin se dejaba domar. Un $ para todo.
    en: "[traducción]"
  snippet:
    file: app.js
    code: |
      $(document).ready(function () {
        $(".menu").click(function () {
          $(this).next().slideToggle();
        });
      });
```

Los textos iniciales de cada capítulo (título, párrafo, fragmento de código y guiño visual) están en el artefacto de diseño. Pásalos a `timeline.yaml` en la Fase 5; a partir de ahí, el YAML es la fuente del contenido.

- `font`: `serif`, `times`, `verdana`, `mono` o `sans` (titular y número gigante). Los tamaños de cada capítulo están en `src/components/Timeline/Chapter.astro`.
- `year`: un texto o `{ es, en }` (el 00 dice "infancia"; el 06, "[año] → hoy").
- `title`: un `\n` (entre comillas dobles) parte el titular en dos líneas.
- `wink` (opcional): `level`, `grid`, `web2`, `mvc`, `services` o `component`; se dibuja en `src/components/Timeline/Wink.astro`.
- `snippet` es opcional: sin él (06), el texto va con el titular y el hueco de la derecha queda para el chat. `file` no se ve; lo anuncia el lector de pantalla.
- El hero y el cierre de la portada son textos de interfaz: están en `src/i18n/ui.ts` (`home`).

## /uses

`src/data/uses.yaml`. Los nombres de producto no se traducen; los porqués sí.

```yaml
updated: "2026-09-30"     # fecha general; se muestra como "30 sep 2026" / "Sep 30, 2026"
sections:
  - id: desarrollo
    title: { es: Desarrollo, en: Development }
    intro: { es: Lo que abro cada día., en: "[traducción]" }
    items:
      - name: Claude Code
        category: { es: Asistente, en: Assistant }
        why: { es: "[por qué]", en: "[traducción]" }
  - id: hardware
    kind: spec           # ficha técnica
    file: build.txt
    items:
      - key: { es: Procesador, en: CPU }
        value: "[modelo]"
  - id: cafe
    kind: coffee
    recipe: { dose: "[18] g", yield: "[36] g", time: "[28] s", temp: "[93] °C", coffee: "[café actual]" }
```

Secciones: Desarrollo, Esta web, IA y creatividad, Hardware (`spec`), Teclados (`spec` + ilustración), Periféricos, Café (`coffee`).

- Tipos de sección: lista (sin `kind`: `items` con `name`, `category`, `why`), `spec` (`file` e `items` con `key` y `value`; `illustration: keyboard` añade el teclado) y `coffee` (`recipe` y, opcionalmente, `items` como una lista).
- Todos los campos de texto (`title`, `intro`, `name`, `category`, `why`, `key`, `value`, `recipe.coffee`) pueden ser un texto plano (igual en ambos idiomas) o `{ es, en }`. En el código se leen con `localize(valor, lang)` de `src/i18n/localize.ts`.
- Un texto con comas dentro de `{ es: …, en: … }` va entre comillas: si no, YAML lo corta en la coma y solo se ve la primera parte (el esquema no lo detecta).

## Contexto de la versión IA

- `src/ai/cv.md`: CV en Markdown, **solo con datos públicos**. Nada de teléfono, dirección, salarios ni datos de clientes.
- Las notas publicadas en español y `uses.yaml` también forman parte del contexto (ver `docs/chat-ia.md`).

## Flujo de publicación

1. `/nueva-nota <tema>` o `/nuevo-experimento <tema>` en Claude Code crea la carpeta y el esqueleto.
2. El autor escribe `es.md` y añade los recursos.
3. `/traducir <ruta>` genera `en.md`. El autor lo revisa.
4. `npm run check`, commit y `git push`. Cloudflare publica en un minuto.
