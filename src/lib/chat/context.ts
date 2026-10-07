// Contexto de la versión IA (docs/chat-ia.md → "Contexto"). Solo se usa en el servidor.
import { getCollection } from 'astro:content';
import cv from '../../ai/cv.md?raw';
import systemPrompt from '../../ai/system-prompt.md?raw';
import uses from '../../data/uses.yaml?raw';
import { isoDate } from '../format';

/** Quita los comentarios HTML (notas para el autor) antes de mandar un archivo al modelo. */
const clean = (text: string) => text.replace(/<!--[\s\S]*?-->/g, '').trim();

export const instructions = clean(systemPrompt);

let cached: Promise<string> | undefined;

/**
 * Bloque de contexto: CV, notas publicadas en español y /uses. Es igual en todas las peticiones,
 * así que va con prompt caching. Se construye una vez por instancia del Worker; si falla, se vuelve
 * a intentar en la siguiente petición en vez de quedarse con el error.
 */
export function context(): Promise<string> {
  cached ??= build().catch((error: unknown) => {
    cached = undefined;
    throw error;
  });
  return cached;
}

async function build(): Promise<string> {
  const notes = (await getCollection('notas', ({ id, data }) => id.endsWith('/es') && !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  const notesText = notes
    .map(({ data, body }) =>
      [`## ${data.title}`, `Fecha: ${isoDate(data.date)} · Etiquetas: ${data.tags.join(', ')}`, '', body?.trim()].join('\n'),
    )
    .join('\n\n---\n\n');
  return [`<cv>\n${clean(cv)}\n</cv>`, `<notas>\n${notesText}\n</notas>`, `<uses>\n${uses.trim()}\n</uses>`].join('\n\n');
}
