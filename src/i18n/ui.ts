import type { Tag } from '../content.config';
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
  notes: {
    intro: 'Textos cortos sobre lo que aprendo construyendo. Sin relleno.',
    topics: 'UX · DX · IA · arte',
    count: { one: '{n} nota', other: '{n} notas' },
    filter: 'Filtrar',
    all: 'Todas',
    list: 'Listado de notas',
    empty: 'Todavía no hay notas.',
    readInSpanish: 'Leer las notas en español',
    back: 'Todas las notas',
    published: 'Publicada',
    updated: 'Actualizada',
    reading: 'Lectura',
    minutes: '{n} min',
    tags: 'Etiquetas',
    copyLink: 'Copiar enlace',
    linkCopied: 'Enlace copiado ✓',
    copyCode: 'Copiar',
    codeCopied: 'Copiado ✓',
    next: 'Siguiente nota',
  },
  lab: {
    meta: 'Experimentos con IA generativa',
    intro: 'Imagen y vídeo generados con IA. Sin pretensiones: probar, mirar y aprender.',
    filter: 'Filtrar',
    all: 'Todo',
    list: 'Experimentos',
    types: { imagen: 'Imagen', video: 'Vídeo' },
    empty: 'Todavía no hay experimentos.',
    readInSpanish: 'Ver los experimentos en español',
    prompt: 'Prompt',
    copyPrompt: 'Copiar prompt',
    promptCopied: 'Prompt copiado ✓',
    learned: 'Qué aprendí',
    pager: 'Otros experimentos',
    prev: 'Anterior',
    next: 'Siguiente',
    keysHint: 'También con las flechas ← → del teclado',
    videoFallback: 'Tu navegador no puede reproducir este vídeo.',
  },
  tags: {
    UX: 'UX',
    DX: 'DX',
    IA: 'IA',
    Arte: 'Arte',
    Proyecto: 'Proyecto',
  } satisfies Record<Tag, string>,
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
  notes: {
    intro: 'Short pieces about what I learn while building. No filler.',
    topics: 'UX · DX · AI · art',
    count: { one: '{n} note', other: '{n} notes' },
    filter: 'Filter',
    all: 'All',
    list: 'List of notes',
    empty: 'There are no notes in English yet.',
    readInSpanish: 'Read the notes in Spanish',
    back: 'All notes',
    published: 'Published',
    updated: 'Updated',
    reading: 'Reading time',
    minutes: '{n} min',
    tags: 'Tags',
    copyLink: 'Copy link',
    linkCopied: 'Link copied ✓',
    copyCode: 'Copy',
    codeCopied: 'Copied ✓',
    next: 'Next note',
  },
  lab: {
    meta: 'Experiments with generative AI',
    intro: 'Images and video made with AI. No pretensions: try things, look and learn.',
    filter: 'Filter',
    all: 'All',
    list: 'Experiments',
    types: { imagen: 'Image', video: 'Video' },
    empty: 'There are no experiments in English yet.',
    readInSpanish: 'See the experiments in Spanish',
    prompt: 'Prompt',
    copyPrompt: 'Copy prompt',
    promptCopied: 'Prompt copied ✓',
    learned: 'What I learned',
    pager: 'More experiments',
    prev: 'Previous',
    next: 'Next',
    keysHint: 'Also with the ← → arrow keys',
    videoFallback: 'Your browser cannot play this video.',
  },
  tags: {
    UX: 'UX',
    DX: 'DX',
    IA: 'AI',
    Arte: 'Art',
    Proyecto: 'Project',
  },
  notFound: {
    title: 'Page not found',
    text: 'This page does not exist',
    home: 'Home',
  },
};

const ui: Record<Locale, Ui> = { es, en };

export const t = (lang: Locale): Ui => ui[lang];

/** Sustituye `{n}` en un texto. */
export const fill = (text: string, n: number) => text.replace('{n}', String(n));
