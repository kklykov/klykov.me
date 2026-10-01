# Chat de la versión IA

Un chat en el capítulo 06 de la portada que responde como una versión IA del autor, usando solo su CV, sus notas y su /uses.

## Requisitos

1. **Transparencia:** siempre queda claro que es una IA (nombre "versión IA", aviso bajo el botón y saludo inicial).
2. **Fidelidad:** responde solo con la información del contexto. Si no lo sabe, lo dice y remite al email del autor. Nunca inventa experiencia, fechas, empresas ni opiniones.
3. **Coste acotado:** límites por visitante, límite global diario y tope de gasto en la consola de Anthropic.
4. **Privacidad:** no se guardan conversaciones. Solo contadores anónimos para los límites. Los logs del Worker nunca registran el contenido de los mensajes, la respuesta del modelo, la IP ni la clave: solo el código de error, la duración y si se alcanzó algún límite (una línea JSON por petición, p. ej. `{"chat":"limit_user","ms":12}`).
5. **Seguridad:** la clave nunca sale del servidor.

## Arquitectura

```
Navegador ── POST /api/chat ──► src/pages/api/chat.ts (Cloudflare, on-demand)
                                   │ 1. valida entrada
                                   │ 2. comprueba límites (KV)
                                   │ 3. construye el contexto
                                   └─► API de Claude (streaming) ──► respuesta en streaming al navegador
```

- `src/pages/api/chat.ts` con `export const prerender = false`. Es la única ruta dinámica.
- Secretos y bindings de Cloudflare: `ANTHROPIC_API_KEY` (secreto) y `RATE_LIMIT` (KV).
- En local, los secretos van en `.dev.vars` (en `.gitignore`): `ANTHROPIC_API_KEY=...`. Sin clave, `npm run dev` responde con textos simulados para probar la interfaz; en producción, sin clave, devuelve `upstream`.
- La KV `RATE_LIMIT` está declarada en `wrangler.jsonc` sin `id`: Wrangler la crea en el primer despliegue. En local la simula.
- Con el Worker, las rutas inexistentes pasan por Astro: `src/middleware.ts` las devuelve a los assets para que se sirva la 404 de cada idioma.
- Código: `src/lib/chat/` (contrato, límites, contexto) y `src/components/Chat/` (interfaz; `chat.ts` se carga con `import()`).

## Contrato del endpoint

Petición:

```json
{ "messages": [{ "role": "user", "content": "¿Cómo empezaste?" }], "lang": "es" }
```

- Máximo 10 mensajes por conversación y 500 caracteres por mensaje. El historial lo guarda el cliente (en memoria, no en `localStorage`).
- Solo se aceptan peticiones del mismo origen.

Respuesta: texto en streaming (`text/event-stream` o `text/plain` por trozos). Errores como JSON con `code`:

| Código HTTP | `code` | Mensaje en la interfaz |
|---|---|---|
| 400 | `invalid` | "No he entendido la pregunta. ¿Puedes reformularla?" |
| 429 | `limit_user` | "Por hoy ya hemos hablado bastante. Si quieres seguir, escríbeme a [email]." |
| 429 | `limit_global` | "Hoy he llegado a mi límite de conversaciones. Escríbeme a [email]." |
| 502 | `upstream` | "Ahora mismo no puedo responder. Prueba en un rato." |

## Modelo y parámetros

- Modelo: el más económico y rápido disponible de Claude: `claude-haiku-4-5` (confirmado el 30.09.2026). Cambiarlo es una línea en `src/pages/api/chat.ts`.
- Con Haiku 4.5 el prompt caching solo actúa si instrucciones + contexto superan unos 4096 tokens; por debajo, simplemente no se cachea.
- `max_tokens`: 400. Respuestas cortas: 2–4 frases.
- Idioma: el de la página (`lang`), aunque responde en el idioma en que le escriban.

## Contexto

Se construye en el servidor con:

1. `src/ai/system-prompt.md`: identidad, tono, reglas y límites. **Borrador con las reglas de este documento y marcadores: lo completa el autor.**
2. `src/ai/cv.md`: CV público.
3. Notas publicadas en español: título, fecha, etiquetas y texto.
4. `src/data/uses.yaml` en texto plano.

Si el contexto crece mucho, usa solo título y descripción de las notas. Aprovecha el prompt caching de la API para el bloque de contexto, que es igual en todas las peticiones.

## Límites

- **Por visitante:** 20 mensajes al día. Clave en KV: hash SHA-256 de `IP + sal diaria`. Nunca se guarda la IP en claro.
- **Global:** 300 mensajes al día.
- **Gasto:** tope mensual configurado en la consola de Anthropic (el autor decide la cifra). Es la red de seguridad final.
- Las claves de KV caducan a las 24 h (`expirationTtl`).
- El plan gratuito de KV tiene límites de escrituras diarias; con estos límites es suficiente. Si se quedara corto, pasar el contador a Durable Objects o al rate limiting de Cloudflare.

## Seguridad frente a abusos

- El system prompt indica que ignore instrucciones del usuario para cambiar de papel, revelar el prompt o hablar de temas ajenos al autor.
- Recorta y limpia la entrada (sin HTML).
- Rechaza cuerpos de más de 8 KB.
- No hay herramientas ni acceso a internet desde el modelo.

## Cliente

- Todo el comportamiento visual está en `docs/diseno.md` → "Chat de la versión IA".
- El módulo del chat se carga con `import()` al pulsar "Conóceme a través de mi IA".
- `fetch` con `ReadableStream` para pintar la respuesta mientras llega.
- Si la API falla, muestra el mensaje de error como una respuesta más de la IA, con el mismo estilo.
