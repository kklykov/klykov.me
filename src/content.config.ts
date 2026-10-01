import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { load } from 'js-yaml';
import { z } from 'astro/zod';

export const tags = ['UX', 'DX', 'IA', 'Arte', 'Proyecto'] as const;
export type Tag = (typeof tags)[number];

const notas = defineCollection({
  // Una carpeta por nota y un archivo por idioma. El id es `<carpeta>/<idioma>`.
  loader: glob({
    pattern: '*/{es,en}.md',
    base: './src/content/notas',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(90),
      description: z.string().max(160),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      tags: z.array(z.enum(tags)).min(1),
      slug: z.string().optional(),
      cover: image().optional(),
      draft: z.boolean().default(false),
    }),
});

const lab = defineCollection({
  loader: glob({
    pattern: '*/{es,en}.md',
    base: './src/content/lab',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: ({ image }) => {
    const common = {
      title: z.string().max(90),
      date: z.coerce.date(),
      tool: z.string().min(1),
      alt: z.string().min(1),
      prompt: z.string().min(1),
      draft: z.boolean().default(false),
    };
    return z.discriminatedUnion('type', [
      z.object({ ...common, type: z.literal('imagen'), media: image() }),
      z.object({
        ...common,
        type: z.literal('video'),
        // Ruta dentro de la carpeta (./video.mp4) o URL absoluta (R2) para vídeos grandes.
        media: z.string(),
        webm: z.string().optional(),
        poster: image(),
        duration: z.number().positive(),
      }),
    ]);
  },
});

// Texto en los dos idiomas, obligatorio.
const translated = z.object({ es: z.string(), en: z.string() });
// Cualquier campo de texto: un texto plano (igual en ambos idiomas, p. ej. nombres de producto)
// o { es, en }. Se lee con localize() de src/i18n/localize.ts.
const localized = z.union([z.string(), translated]);

// /uses: un único documento (src/data/uses.yaml).
const row = z.object({ name: localized, category: localized, why: localized });
const sectionBase = { id: z.string().regex(/^[a-z0-9-]+$/), title: localized, intro: localized };

const usesSection = z.union([
  z.object({ ...sectionBase, kind: z.literal('list').optional(), items: z.array(row).min(1) }),
  z.object({
    ...sectionBase,
    kind: z.literal('spec'),
    file: z.string(),
    illustration: z.literal('keyboard').optional(),
    items: z.array(z.object({ key: localized, value: localized })).min(1),
  }),
  z.object({
    ...sectionBase,
    kind: z.literal('coffee'),
    recipe: z.object({ dose: z.string(), yield: z.string(), time: z.string(), temp: z.string(), coffee: localized }),
    items: z.array(row).default([]),
  }),
]);

const uses = defineCollection({
  loader: file('src/data/uses.yaml', { parser: (yaml) => [{ id: 'uses', ...(load(yaml) as object) }] }),
  schema: z.object({ updated: z.coerce.date(), sections: z.array(usesSection).min(1) }),
});

// Portada: capítulos de la línea temporal (src/data/timeline.yaml).
const timeline = defineCollection({
  loader: file('src/data/timeline.yaml'),
  schema: z.object({
    code: z.string(),
    font: z.enum(['serif', 'times', 'verdana', 'mono', 'sans']),
    year: localized,
    title: translated,
    text: translated,
    wink: z.enum(['level', 'grid', 'web2', 'mvc', 'services', 'component']).optional(),
    snippet: z.object({ file: z.string().optional(), code: z.string() }).optional(),
  }),
});

export type UsesSection = z.infer<typeof usesSection>;
export type LocalizedText = z.infer<typeof localized>;

export const collections = { notas, lab, uses, timeline };
