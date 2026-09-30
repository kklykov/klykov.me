import { getEntry } from 'astro:content';
import type { LocalizedText } from '../content.config';
import type { Locale } from '../i18n/config';

export async function getUses() {
  const entry = await getEntry('uses', 'uses');
  if (!entry) throw new Error('Falta src/data/uses.yaml');
  return entry.data;
}

/** Un texto plano vale para todos los idiomas. */
export const inLang = (value: LocalizedText, lang: Locale) => (typeof value === 'string' ? value : value[lang]);
