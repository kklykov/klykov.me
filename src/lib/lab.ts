import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from '../i18n/config';
import { sectionUrl } from '../i18n/routes';
import { byDateDesc, isPublished, splitId, type Localized } from './content';

export interface Experiment extends Localized {
  entry: CollectionEntry<'lab'>;
}

function toExperiment(entry: CollectionEntry<'lab'>): Experiment {
  const [key, lang] = splitId(entry.id);
  return { entry, key, lang, url: `${sectionUrl('lab', lang)}${key}/` };
}

/** Experimentos publicados, del más reciente al más antiguo. */
export async function getExperiments(lang?: Locale): Promise<Experiment[]> {
  const entries = await getCollection('lab', isPublished);
  return entries
    .map(toExperiment)
    .filter((item) => !lang || item.lang === lang)
    .sort((a, b) => byDateDesc(a.entry.data, b.entry.data));
}

// Los vídeos viven en la carpeta de cada experimento; Vite los copia al build con hash.
const videoFiles = import.meta.glob<string>('/src/content/lab/*/*.{mp4,webm}', {
  query: '?url',
  import: 'default',
  eager: true,
});

/** URL pública de un vídeo: una ruta de la carpeta (./video.mp4) o una URL absoluta (R2). */
export function videoUrl(key: string, src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  const url = videoFiles[`/src/content/lab/${key}/${src.replace(/^\.\//, '')}`];
  if (!url) throw new Error(`No existe el vídeo ${src} en src/content/lab/${key}/`);
  return url;
}
