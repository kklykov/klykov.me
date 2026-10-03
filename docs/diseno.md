# Reglas de diseño y comportamiento

**Lo visual está en el artefacto de diseño:** https://claude.ai/artifact/U6cyBdr6Z4hZXBbfLhdEcT (página "Diseño"; ignora la página "Descartadas"). Este documento solo recoge lo que el lienzo no expresa: escala, recorrido, accesibilidad, movimiento reducido, versión sin JS y la lógica de los componentes interactivos.

## Generales

- Puntos de corte: móvil < 1024px ≤ escritorio. El escenario horizontal de la portada solo se activa en escritorio.
- Solo se animan `transform` y `opacity`.
- `prefers-reduced-motion: reduce`: sin parallax, sin inercia, sin transiciones, sin efecto de escritura en el chat, sin trazado animado y sin View Transitions.
- Sin JS, todo el contenido es visible y navegable. Los filtros y el índice de capítulos se ocultan.
- Las tipografías de época (Times New Roman, Verdana) son del sistema: no se descargan.
- El guiño visual y el fragmento de código de cada capítulo cuentan lo mismo. Por ejemplo, el acordeón del 02 es lo que hace su `slideToggle()`, y la tarjeta del 05 es lo que pinta su componente `Note`.

## Cabecera y pie

- La sección actual lleva `aria-current="page"`.
- El selector de idioma lleva a la misma página en el otro idioma; si no existe, a la portada de ese idioma.
- El pie aparece en todas las páginas. En la portada aparece en la parada final, debajo de "Y lo que venga.".
- Email del pie según el idioma: `hola@klykov.me` en `/es` y `hello@klykov.me` en `/en`.

## Portada: escritorio

### Escala

- La portada se diseña a 1280×800. En pantallas mayores escala con `u = min(100vw / 1280, 100vh / 800)`, sin topes.
- Escalan con `u`: los números gigantes del fondo, los titulares en display ("De las tablas a la IA.", títulos de capítulo y "Y lo que venga.") y los recorridos del parallax.
- Escalan con `u-detail = (u + 1) / 2` (crecen la mitad que el resto): los guiños de cada época (NIVEL 00 y vidas, dibujo del mando, acordeón de jQuery, cajas MVC, microservicios y tarjeta `<Note />`). Empiezan en el mismo margen izquierdo que el texto del capítulo (96px a 1280) y escalan desde ese origen.
- No escalan: etiquetas, párrafos, código, barra superior, menú inferior y chat. Mantienen sus tamaños de 1280×800.

### Escenario y paradas

- La portada, los 7 capítulos y el cierre forman un único escenario anclado (`position: sticky` de `100vh`).
- Imán con 9 paradas, todas a una pantalla de distancia: portada, capítulos 00 a 06 y final. `scroll-snap-type: y mandatory` en la portada y marcadores invisibles de `100vh` con `scroll-snap-align: start` y `scroll-snap-stop: always`. Nada de capturar la rueda con JavaScript.
- Entre la portada y el 00, y entre el 06 y el final, el movimiento es vertical. Entre capítulos, horizontal.
- No hay parada intermedia en el cierre. Desde el 06, un paso lleva al final: "Y lo que venga." con el pie debajo, a la vez, en una sola pantalla. El cierre ocupa una pantalla y en la parada final sube lo justo (el alto del pie) para dejar verlo.

### Movimiento

- Todo lo visual sigue al scroll con inercia: `actual += (objetivo − actual) × 0.085` por frame (~0,9 s). Incluye la entrada desde la portada al 00 y la salida del 06 al final.
- Los botones del menú inferior y "Desliza ↓" saltan a su parada sin animación de scroll; la inercia hace el recorrido visual. Así la rueda, el trackpad, el teclado y los botones se sienten igual de suaves.
- "Desliza ↓" se comporta como un botón del menú que va al 00.
- Con movimiento reducido no hay inercia.

### Parallax por capas

Con `local = posición − i` (posición entre 0 y 6, suavizada):

- Número gigante (detrás, más lento): `translateX(local × 420u) scale(1 − min(1, |local|) × 0.12)`.
- Guiños de época (en medio): `translateX(−local × 160u)`.
- Contenido (delante, más rápido): `translateX(−local × 280u) translateY(min(1, |local|) × 24u)` y `opacity: max(0, 1 − |local| × 1.6)`.

En reposo todo queda alineado; el movimiento solo se ve durante las transiciones.

### Barra superior y menú inferior

- La barra superior muestra el código de época y el nombre del capítulo actual.
- Menú inferior: botones de 44×44 como mínimo, `aria-current="step"` en el capítulo actual y nombre visible con `:hover` y `:focus-visible`.
- Con movimiento reducido o sin JS, los capítulos se apilan en vertical, sin escenario anclado, con `scroll-snap-type: y proximity`.

## Portada: móvil

- Capítulos de `100svh` con `scroll-snap-type: y proximity`. El anclaje obligatorio da tirones en Safari cuando su barra aparece y desaparece.
- Barra superior fija con el índice desplegable: botón con `aria-expanded` y `aria-controls`. Se cierra al elegir un capítulo, al tocar fuera, con Escape o al volver a pulsar. Al cerrarse, el foco vuelve al botón.
- **Sin menú inferior.**
- `viewport-fit=cover` y `env(safe-area-inset-*)` en la barra superior y en los capítulos.
- Parallax vertical del número gigante (`translateY(local × 220px)`), desactivado con movimiento reducido.
- El capítulo 06 cabe en una pantalla. Al abrir el chat se ocultan el "IA" gigante y su texto, y el chat ocupa toda la altura.
- El Código Konami es solo decorativo (no hay teclado).

## Capítulo 00

### Dibujo del mando

- Un mando de videojuegos dibujado a trazos, en el color de acento: contorno (con un segundo repaso tenue), cruceta, botones B y A con sus letras, select y start, y cable. Los trazos exactos están en el artefacto.
- Se traza trazo a trazo con `pathLength="1"` y `stroke-dashoffset` de 1 a 0, en ~3 s en total, con una curva de aceleración de mano (`cubic-bezier(.45, .05, .35, 1)`).
- Se traza **una sola vez**, cuando la transición desde la portada hacia el 00 llega al 90 % (el capítulo está prácticamente en su sitio). Si el usuario vuelve, el dibujo ya está completo. Nunca empieza al cargar la página.
- Por defecto, los trazos están ocultos y sin animación.
- Con movimiento reducido, se muestra completo desde el principio.
- Decorativo: `aria-hidden="true"`.

### Código Konami (solo escritorio)

- Listener de `keydown` en `document`. Ignora el teclado cuando el foco está en `input` o `textarea` (el chat tiene su propio manejador y no interfiere). **No** llama a `preventDefault`: las flechas siguen desplazando la página.
- Un error reinicia la secuencia, salvo un ↑ extra tras ↑↑, que mantiene el progreso.
- Los diez caracteres están dispersos y son decorativos (`aria-hidden`). Posiciones y tamaños a 1280, relativos al origen de los guiños (margen izquierdo del texto, 96 × 120):

  | Carácter | x | y | Tamaño |
  |---|---|---|---|
  | ↑ | 424 | −24 | 22 |
  | ↑ | 516 | 32 | 16 |
  | ↓ | 156 | −28 | 15 |
  | ↓ | 374 | 182 | 26 |
  | ← | 54 | 202 | 18 |
  | → | 464 | 112 | 14 |
  | ← | 266 | 26 | 18 |
  | → | 546 | 168 | 20 |
  | B | 204 | 214 | 16 |
  | A | 590 | −12 | 24 |

  En pantallas grandes, las posiciones se multiplican por `u` (se esparcen más) y el tamaño por `u-detail`.
- Al acertar cada tecla, su carácter se enciende en el color de acento y crece un 30 % (`scale(1.3)`, transición de 300 ms).
- Al completar el código: "NIVEL 00" pasa a "NIVEL 999" en acento, se rellena la 4.ª vida, aparece "+30" a la derecha de las vidas y los diez caracteres hacen una ola (`translateY(−5px)`, 60 ms de desfase) sin perder su tamaño grande. Sin ola con movimiento reducido.
- Una región `aria-live="polite"` anuncia: "Código Konami activado: nivel 999 y 30 vidas extra."

## Chat de la versión IA

- El módulo se carga con `import()` al pulsar "Conóceme a través de mi IA".
- `<label>` visualmente oculto para el campo; Enter envía.
- Una región `aria-live="polite"` anuncia **la respuesta completa una sola vez** al terminar, nunca carácter a carácter.
- Al abrir el chat, el foco va al campo de texto; al cerrarlo, vuelve al botón que lo abrió.
- El historial solo vive en memoria (nada de `localStorage`).
- Endpoint, límites, errores y logs: `docs/chat-ia.md`.

## Notas y Lab

- Filtros como mejora progresiva, con `aria-pressed`. Sin JS, se ven todas las piezas.
- Entrada de los filtros al cargar: "Todas" (en Lab, "Todo") se ve desde el principio, seleccionado. El resto aparece de `opacity: 0` y `translateX(−8px)` a su posición final, en 320 ms con `cubic-bezier(.2, .7, .1, 1)`, escalonados 40 ms. Solo al cargar, no al cambiar de filtro. Sin animación con movimiento reducido.
- Barra de progreso de lectura solo con CSS (`animation-timeline: scroll()`); si no hay soporte, no aparece.
- Bloques de código con Shiki (incluido en Astro) y un tema propio con los colores del diseño.
- Experimento: `<video>` con `poster`, `controls`, `playsinline` y `preload="metadata"`. **Nunca** reproducción automática. Anterior y siguiente también con las flechas del teclado (sin capturarlas si el foco está en un control).
- Transición de la tarjeta al experimento: View Transitions entre documentos solo con CSS (`@view-transition { navigation: auto; }` y `view-transition-name` en el medio). Sin `ClientRouter`.

## /uses

- Sección activa del índice con `IntersectionObserver`.
- Los enlaces del índice son anclas normales (`#hardware`), para que cada sección tenga URL propia; el JS solo añade el desplazamiento suave y el estado activo.
- Las fichas técnicas (Hardware y Teclados) no muestran fecha. Solo hay una fecha de actualización general, arriba de la página.
- `name` y `value` en `uses.yaml` aceptan texto simple u objeto `{ es, en }`.

## 404

No está en el lienzo. Sobria: "Esta página no existe." con enlaces a la portada, Notas y Lab, usando los estilos de las demás páginas.