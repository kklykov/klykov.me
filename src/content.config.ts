import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
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

export const collections = { notas, lab };
