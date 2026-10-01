# Reglas de diseño y comportamiento

**Lo visual está en el artefacto de diseño:** https://claude.ai/artifact/U6cyBdr6Z4hZXBbfLhdEcT (página "Diseño"). Este documento solo recoge lo que el lienzo no expresa: accesibilidad, movimiento reducido, versión sin JS y la lógica de los componentes interactivos.

## Generales

- Puntos de corte: móvil < 1024px ≤ escritorio. La línea temporal horizontal solo se activa en escritorio.
- `clamp()` para interpolar tamaños de letra y márgenes entre las medidas de móvil y de escritorio del artefacto.
- Solo se animan `transform` y `opacity`.
- `prefers-reduced-motion: reduce`: sin parallax, sin transiciones, sin efecto de escritura en el chat y sin View Transitions.
- Sin JS, todo el contenido es visible y navegable. El índice de capítulos se oculta; de los filtros solo se ve "Todas", seleccionada.
- Las tipografías de época (Times New Roman, Verdana) son del sistema: no se descargan.

## Cabecera y pie

- La sección actual lleva `aria-current="page"`.
- El selector de idioma lleva a la misma página en el otro idioma; si no existe, a la portada de ese idioma.
- El pie aparece en **todas** las páginas, también al final de la portada (el lienzo no lo muestra ahí).

## Línea temporal: escritorio

- Sección anclada de `100vh + 6 × 900px`; dentro, un contenedor `sticky` de `100vh` con la pista horizontal de 7 paneles de `100vw`.
- Progreso `p = clamp((scrollY − inicio) / recorrido, 0, 1)` y pista con `translate3d(−p × 6 × 100vw, 0, 0)`.
- Para cada panel `i`, con `local = p × 6 − i`: número gigante con `translateX(−local × 360px)`; contenido con `opacity = max(0.1, 1 − |local| × 1.4)` y `translateY(min(1, |local|) × 48px)`.
- Un único listener de `scroll` pasivo que escribe en `requestAnimationFrame`. Sin librerías.
- Menú inferior: botones de 44×44 mínimo, `aria-current="step"` en el capítulo actual y nombre visible con `:hover` y `:focus-visible`. Al pulsar, `scrollTo` a `inicio + i/6 × recorrido` (suave, salvo con movimiento reducido).
- Con movimiento reducido o sin JS, los capítulos se apilan en vertical, sin anclaje.

## Línea temporal: móvil

- Capítulos (y portada) de `100lvh`, el alto con las barras del navegador ocultas, con `scroll-snap-type: y proximity`. La diferencia con `100svh` va al margen inferior: con las barras visibles el contenido cabe entero, y al ocultarse no asoma el capítulo siguiente.
- Barra superior fija con el índice desplegable: botón con `aria-expanded` y `aria-controls`. Se cierra al elegir un capítulo, al tocar fuera, con Escape o al volver a pulsar. Al cerrarse, el foco vuelve al botón.
- **Sin menú inferior.**
- `viewport-fit=cover` y `env(safe-area-inset-*)` en la barra superior y en los capítulos.
- Parallax vertical del número gigante (`translateY(local × 220px)`), desactivado con movimiento reducido.
- El capítulo 06 cabe en una pantalla. Al abrir el chat se ocultan el "IA" gigante y su texto.

## Código Konami (solo escritorio)

- Listener de `keydown` en `document`. Ignora el teclado cuando el foco está en `input` o `textarea`. **No** llama a `preventDefault`: las flechas siguen desplazando la página.
- Un error reinicia la secuencia, salvo un ↑ extra tras ↑↑, que mantiene el progreso.
- Los caracteres dispersos son decorativos (`aria-hidden`).
- Al completarlo, una región `aria-live="polite"` anuncia: "Código Konami activado: nivel 999 y 30 vidas extra."

## Chat de la versión IA

- El módulo se carga con `import()` al pulsar "Conóceme a través de mi IA".
- `<label>` visualmente oculto para el campo; Enter envía.
- Una región `aria-live="polite"` anuncia **la respuesta completa una sola vez** al terminar, nunca carácter a carácter.
- Al abrir el chat, el foco va al campo de texto; al cerrarlo, vuelve al botón que lo abrió.
- Móvil: al abrirse el teclado, el formulario se coloca justo encima (el navegador lo dejaría centrado) y, al cerrarse, la página vuelve a donde estaba. Con el chat abierto no hay `scroll-snap`.
- El historial solo vive en memoria (nada de `localStorage`).
- Endpoint, límites y errores: `docs/chat-ia.md`.

## Notas y Lab

- Filtros como mejora progresiva, con `aria-pressed`. "Todas" está siempre en el HTML, seleccionada, para que la fila ocupe su sitio desde el principio y no empuje la lista. El resto de opciones aparecen con el JS con una entrada sutil hacia la derecha (`opacity` y `transform`, escalonada; sin animación con movimiento reducido). Sin JS, se ven todas las piezas.
- Barra de progreso de lectura solo con CSS (`animation-timeline: scroll()`); si no hay soporte, no aparece.
- Bloques de código con Shiki (incluido en Astro) y un tema propio con los colores del diseño.
- Experimento: `<video>` con `poster`, `controls`, `playsinline` y `preload="metadata"`. **Nunca** reproducción automática. Anterior y siguiente también con las flechas del teclado (sin capturarlas si el foco está en un control).
- Transición de la tarjeta al experimento: View Transitions entre documentos solo con CSS (`@view-transition { navigation: auto; }` y `view-transition-name` en el medio). Sin `ClientRouter`.

## /uses

- Sección activa del índice con `IntersectionObserver`.
- Los enlaces del índice son anclas normales (`#hardware`), para que cada sección tenga URL propia; el JS solo añade el desplazamiento suave y el estado activo.

## 404

No está en el lienzo. Sobria: "Esta página no existe." con enlaces a la portada, Notas y Lab, usando los estilos de las demás páginas.
