import { defaultLocale, isLocale, locales, type Locale } from './config';

/** Segmento de URL de cada sección en cada idioma. */
export const sections = {
  notes: { es: 'notas', en: 'notes' },
  lab: { es: 'lab', en: 'lab' },
  uses: { es: 'uses', en: 'uses' },
} as const satisfies Record<string, Record<Locale, string>>;

export type Section = keyof typeof sections;

const sectionKeys = Object.keys(sections) as Section[];

export const homeUrl = (lang: Locale) => `/${lang}/`;

export const sectionUrl = (section: Section, lang: Locale) => `/${lang}/${sections[section][lang]}/`;

/** `/en/notes/mi-nota/` → `{ lang: 'en', section: 'notes', rest: 'mi-nota/' }` */
export function parsePath(pathname: string): { lang: Locale; section?: Section; rest: string } {
  const [, first, second, ...rest] = pathname.split('/');
  const lang = isLocale(first) ? first : defaultLocale;
  const section = sectionKeys.find((key) => sections[key][lang] === second);
  return { lang, section, rest: section ? rest.join('/') : '' };
}

/**
 * La misma página en cada idioma, traduciendo el segmento de sección.
 * Las páginas con slugs distintos por idioma (notas) pasan sus alternativas a mano.
 */
export function alternatesFor(pathname: string): Record<Locale, string> {
  const { section, rest } = parsePath(pathname);
  return Object.fromEntries(
    locales.map((lang) => [lang, section ? sectionUrl(section, lang) + rest : homeUrl(lang)]),
  ) as Record<Locale, string>;
}
