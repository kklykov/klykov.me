import type { Locale } from '../i18n/config';

// Enlaces del pie (y del chat). El email cambia según el idioma de la página.
export const links = {
  email: { es: 'hola@klykov.me', en: 'hello@klykov.me' } satisfies Record<Locale, string>,
  github: 'https://github.com/kklykov',
  linkedin: 'https://www.linkedin.com/in/kklykov/',
  klykovCo: 'https://klykov.co',
};
