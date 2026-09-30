import type { Locale } from './config';

const es = {
  langName: 'Español',
  skipToContent: 'Saltar al contenido',
  nav: {
    label: 'Principal',
    notes: 'Notas',
    lab: 'Lab',
  },
  footer: {
    madeWith: 'Hecho con café y Claude Code',
    label: 'Enlaces',
  },
  pages: {
    notes: 'Notas',
    lab: 'Lab',
    uses: 'Lo que uso',
  },
  notFound: {
    title: 'Página no encontrada',
    text: 'Esta página no existe',
    home: 'Portada',
  },
};

type Ui = typeof es;

const en: Ui = {
  langName: 'English',
  skipToContent: 'Skip to content',
  nav: {
    label: 'Main',
    notes: 'Notes',
    lab: 'Lab',
  },
  footer: {
    madeWith: 'Made with coffee and Claude Code',
    label: 'Links',
  },
  pages: {
    notes: 'Notes',
    lab: 'Lab',
    uses: 'What I use',
  },
  notFound: {
    title: 'Page not found',
    text: 'This page does not exist',
    home: 'Home',
  },
};

const ui: Record<Locale, Ui> = { es, en };

export const t = (lang: Locale): Ui => ui[lang];
