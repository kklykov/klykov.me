export const defaultLocale = 'es';
export const locales = ['es', 'en'] as const;

export type Locale = (typeof locales)[number];

/** Quita el prefijo de idioma: `/en/notas/` → `/notas/`. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split('/');
  return (locales as readonly string[]).includes(first) ? `/${rest.join('/')}` : pathname;
}
