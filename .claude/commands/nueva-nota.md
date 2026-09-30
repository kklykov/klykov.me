---
description: Crea el esqueleto de una nota nueva en español
argument-hint: <tema o título de la nota>
---

Crea una nota nueva sobre: $ARGUMENTS

1. Propón un título corto (máximo 90 caracteres) y un slug en kebab-case sin tildes. Si el título ya viene dado, úsalo tal cual.
2. Crea `src/content/notas/<slug>/es.md` con el frontmatter completo y válido según `docs/contenido.md`:
   - `date`: la fecha de hoy.
   - `tags`: propón las etiquetas que encajen, solo de la lista permitida.
   - `description`: una frase de menos de 160 caracteres.
   - `draft: true`.
3. En el cuerpo, deja solo una estructura sugerida (entradilla y dos o tres subtítulos) con marcadores `[…]` para que yo escriba el texto. **No escribas el contenido por mí.**
4. Ejecuta `npm run check` y dime la ruta del archivo creado.
