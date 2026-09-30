import { getCollection, type CollectionEntry } from 'astro:content';
import type { Tag } from '../content.config';
import type { Locale } from '../i18n/config';
import { sectionUrl } from '../i18n/routes';
import { byDateDesc, isPublished, splitId, type Localized } from './content';

export interface Note extends Localized {
  entry: CollectionEntry<'notas'>;
  slug: string;
  minutes: number;
}

const WORDS_PER_MINUTE = 220;

const readingMinutes = (body = '') =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));

function toNote(entry: CollectionEntry<'notas'>): Note {
  const [key, lang] = splitId(entry.id);
  const slug = entry.data.slug ?? key;
  return { entry, key, lang, slug, url: `${sectionUrl('notes', lang)}${slug}/`, minutes: readingMinutes(entry.body) };
}

/** Notas publicadas, de la más reciente a la más antigua. */
export async function getNotes(lang?: Locale): Promise<Note[]> {
  const entries = await getCollection('notas', isPublished);
  return entries
    .map(toNote)
    .filter((note) => !lang || note.lang === lang)
    .sort((a, b) => byDateDesc(a.entry.data, b.entry.data));
}

/** Etiquetas usadas por alguna de las notas, en el orden del esquema. */
export function usedTags(notes: Note[], order: readonly Tag[]): Tag[] {
  const used = new Set(notes.flatMap((n) => n.entry.data.tags));
  return order.filter((tag) => used.has(tag));
}
