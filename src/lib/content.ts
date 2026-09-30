import type { LocalizedText } from '../content.config';
import type { Locale } from '../i18n/config';

/** Un texto plano vale para todos los idiomas. */
export const inLang = (value: LocalizedText, lang: Locale) => (typeof value === 'string' ? value : value[lang]);

/** Una pieza en un idioma. `key` es el nombre de la carpeta y une sus traducciones. */
export interface Localized {
  key: string;
  lang: Locale;
  url: string;
}

/** `lo-util/es` → `['lo-util', 'es']` */
export const splitId = (id: string) => id.split('/') as [string, Locale];

/** Los borradores solo se ven en desarrollo. */
export const isPublished = ({ data }: { data: { draft: boolean } }) => import.meta.env.DEV || !data.draft;

export const byDateDesc = (a: { date: Date }, b: { date: Date }) => b.date.valueOf() - a.date.valueOf();

/** URL de la pieza en cada idioma en que existe. */
export function alternatesOf(item: Localized, all: Localized[]): Partial<Record<Locale, string>> {
  return Object.fromEntries(all.filter((i) => i.key === item.key).map((i) => [i.lang, i.url]));
}

/** Vecinos en una lista ordenada, en bucle. Sin vecinos si la lista tiene un solo elemento. */
export function neighbors<T>(list: T[], item: T): { prev?: T; next?: T } {
  if (list.length < 2) return {};
  const i = list.indexOf(item);
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] };
}
