---
description: Crea el esqueleto de un experimento del Lab
argument-hint: <título del experimento> [imagen|video]
---

Crea un experimento nuevo del Lab: $ARGUMENTS

1. Si no se indica, pregunta si es imagen o vídeo.
2. Crea `src/content/lab/<slug>/es.md` con el frontmatter válido según `docs/contenido.md`:
   - `date`: la fecha de hoy.
   - `tool`, `prompt` y `alt`: marcadores `[…]` para que yo los rellene.
   - `media` (y `webm`, `poster` y `duration` si es vídeo) apuntando a archivos dentro de la misma carpeta.
3. Cuerpo: solo el marcador `[Qué aprendí: dos o tres frases.]`.
4. Dime qué archivos de imagen o vídeo tengo que copiar en la carpeta y con qué nombres. Si es vídeo, recuérdame el formato (≤ 10 s, MP4 + WebM, sin audio, ≤ 5 MB) y dame el comando de `ffmpeg` para convertirlo.
