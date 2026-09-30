import { getCollection, type CollectionEntry } from 'astro:content';
import type { Tag } from '../content.config';
import type { Locale } from '../i18n/config';
import { sectionUrl } from '../i18n/routes';

export interface Note {
  entry: CollectionEntry<'notas'>;
  /** Nombre de la carpeta: une las traducciones de una misma nota. */
  key: string;
  lang: Locale;
  slug: string;
  url: string;
  minutes: number;
}

const WORDS_PER_MINUTE = 220;

const readingMinutes = (body = '') =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));

function toNote(entry: CollectionEntry<'notas'>): Note {
  const [key, lang] = entry.id.split('/') as [string, Locale];
  const slug = entry.data.slug ?? key;
  return { entry, key, lang, slug, url: `${sectionUrl('notes', lang)}${slug}/`, minutes: readingMinutes(entry.body) };
}

/** Notas publicadas (los borradores solo en desarrollo), de la más reciente a la más antigua. */
export async function getNotes(lang?: Locale): Promise<Note[]> {
  const entries = await getCollection('notas', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries
    .map(toNote)
    .filter((note) => !lang || note.lang === lang)
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf());
}

/** URL de la nota en cada idioma en que existe. */
export function alternatesOf(note: Note, all: Note[]): Partial<Record<Locale, string>> {
  return Object.fromEntries(all.filter((n) => n.key === note.key).map((n) => [n.lang, n.url]));
}

/** Etiquetas usadas por alguna de las notas, en el orden del esquema. */
export function usedTags(notes: Note[], order: readonly Tag[]): Tag[] {
  const used = new Set(notes.flatMap((n) => n.entry.data.tags));
  return order.filter((tag) => used.has(tag));
}

/** 01.10.2026 */
export function formatDate(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;
}

export const isoDate = (date: Date) => date.toISOString().slice(0, 10);
