// @ts-check
import { rename, rm } from 'node:fs/promises';
import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { defaultLocale, locales } from './src/i18n/config.ts';

const fonts = './src/styles/fonts';

/**
 * Cloudflare sirve el 404.html más cercano a la URL pedida. Astro genera
 * /<idioma>/404/index.html; se mueve a /404.html (idioma por defecto) y a /<idioma>/404.html.
 * @type {import('astro').AstroIntegration}
 */
const localized404 = {
  name: 'localized-404',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      for (const lang of locales) {
        const target = lang === defaultLocale ? '404.html' : `${lang}/404.html`;
        await rename(new URL(`${lang}/404/index.html`, dir), new URL(target, dir));
        await rm(new URL(`${lang}/404/`, dir), { recursive: true });
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://klykov.me',
  // Todo prerenderizado; solo /api/chat (fase 7) se servirá bajo demanda.
  output: 'static',
  // Imágenes optimizadas en el build; sin bindings de Cloudflare Images.
  adapter: cloudflare({ imageService: 'compile' }),
  // Sin sesiones: evita que el adaptador cree una KV para ellas.
  session: false,

  i18n: {
    defaultLocale,
    locales: [...locales],
    routing: { prefixDefaultLocale: true },
  },
  redirects: {
    '/': `/${defaultLocale}/`,
  },
  integrations: [localized404],

  // Autoalojadas, woff2 con subset latino. Cada familia define su variable CSS.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Instrument Serif',
      cssVariable: '--font-serif',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: [`${fonts}/instrument-serif-latin-400-normal.woff2`], weight: 400, style: 'normal' },
          { src: [`${fonts}/instrument-serif-latin-400-italic.woff2`], weight: 400, style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Sans',
      cssVariable: '--font-sans',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: [`${fonts}/ibm-plex-sans-latin-400-normal.woff2`], weight: 400, style: 'normal' },
          { src: [`${fonts}/ibm-plex-sans-latin-500-normal.woff2`], weight: 500, style: 'normal' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'IBM Plex Mono',
      cssVariable: '--font-mono',
      fallbacks: ['ui-monospace', 'monospace'],
      options: {
        variants: [
          { src: [`${fonts}/ibm-plex-mono-latin-400-normal.woff2`], weight: 400, style: 'normal' },
          { src: [`${fonts}/ibm-plex-mono-latin-500-normal.woff2`], weight: 500, style: 'normal' },
        ],
      },
    },
  ],
});
