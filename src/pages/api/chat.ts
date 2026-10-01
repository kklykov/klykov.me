// Chat de la versión IA (docs/chat-ia.md). Única ruta bajo demanda: la clave nunca sale del servidor.
import Anthropic from '@anthropic-ai/sdk';
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { defaultLocale, isLocale, type Locale } from '../../i18n/config';
import { context, instructions } from '../../lib/chat/context';
import { consume } from '../../lib/chat/limits';
import { MAX_BODY_BYTES, parseMessages, type ErrorCode } from '../../lib/chat/protocol';

export const prerender = false;

/** El más económico y rápido (docs/chat-ia.md → "Modelo y parámetros"). */
const MODEL = 'claude-haiku-4-5';
const MAX_TOKENS = 400;
const LANGUAGE: Record<Locale, string> = { es: 'español', en: 'English' };

const noStore = { 'cache-control': 'no-store' };

/**
 * Una línea por petición, solo con el resultado y la duración (docs/chat-ia.md → "Privacidad").
 * Nunca mensajes, respuestas, IP, clave ni objetos de error: pueden llevar cualquiera de ellos dentro.
 */
type Outcome = 'ok' | ErrorCode | 'missing_key' | 'stream';
const log = (outcome: Outcome, start: number, status?: number) =>
  console.log(JSON.stringify({ chat: outcome, ms: Date.now() - start, ...(status ? { status } : {}) }));

export const POST: APIRoute = async ({ request, url }) => {
  const start = Date.now();
  const fail = (status: number, code: ErrorCode) => {
    log(code, start);
    return Response.json({ code }, { status, headers: noStore });
  };

  // Solo peticiones del mismo origen, con cuerpo pequeño y un historial válido.
  if (request.headers.get('origin') !== url.origin) return fail(403, 'invalid');
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return fail(400, 'invalid');
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return fail(400, 'invalid');

  let body: { messages?: unknown; lang?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400, 'invalid');
  }
  const messages = parseMessages(body.messages);
  if (!messages) return fail(400, 'invalid');
  const lang = isLocale(body.lang) ? body.lang : defaultLocale;

  if (!env.ANTHROPIC_API_KEY) {
    if (import.meta.env.DEV) return simulated(messages.at(-1)!.content);
    log('missing_key', start);
    return Response.json({ code: 'upstream' }, { status: 502, headers: noStore });
  }

  const limit = await consume(env.RATE_LIMIT, request.headers.get('cf-connecting-ip') ?? 'local');
  if (limit !== 'ok') return fail(429, limit);

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1 });
  let stream;
  try {
    stream = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      stream: true,
      // Instrucciones y contexto son iguales en todas las peticiones: van en caché.
      // El idioma de la página y la fecha (para calcular la edad) cambian: van después del punto de caché.
      system: [
        { type: 'text', text: instructions },
        { type: 'text', text: await context(), cache_control: { type: 'ephemeral' } },
        { type: 'text', text: `Idioma de la página: ${LANGUAGE[lang]}. Fecha de hoy: ${new Date().toISOString().slice(0, 10)}.` },
      ],
      messages,
    });
  } catch (error) {
    log('upstream', start, error instanceof Anthropic.APIError ? error.status : undefined);
    return Response.json({ code: 'upstream' }, { status: 502, headers: noStore });
  }

  const encoder = new TextEncoder();
  const text = new ReadableStream<Uint8Array>({
    async start(controller) {
      let outcome: Outcome = 'ok';
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch {
        outcome = 'stream';
      }
      log(outcome, start);
      controller.close();
    },
    cancel() {
      stream.controller.abort();
    },
  });

  return new Response(text, {
    headers: { ...noStore, 'content-type': 'text/plain; charset=utf-8', 'x-content-type-options': 'nosniff' },
  });
};

// Solo en desarrollo y sin clave: respuestas simuladas para probar la interfaz (textos del artefacto).
const SIMULATED: Record<string, string> = {
  '¿Cómo empezaste?':
    'Maquetando con tablas en HTML y CSS a mano, hace más de diez años. Después llegaron jQuery, MVC, los microservicios y los frameworks JS. Hoy trabajo con IA a diario.',
  '¿Qué te importa al construir?':
    'Que sea útil. Una UI bonita no sirve si no ayuda al usuario, y un stack mal planteado no sirve si la DX es mala.',
  '¿Y fuera del código?':
    'Café, sobre todo espresso y filtro desde 2019. También dibujo, videojuegos desde pequeño y entrenar.',
};

function simulated(question: string): Response {
  const answer = SIMULATED[question] ?? '(Simulación) Aquí respondería mi versión IA a partir de mi CV y mis notas.';
  const encoder = new TextEncoder();
  const words = answer.split(/(?<= )/);
  const text = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      controller.close();
    },
  });
  return new Response(text, { headers: { ...noStore, 'content-type': 'text/plain; charset=utf-8' } });
}
