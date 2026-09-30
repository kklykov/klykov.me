import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { locales, type Locale } from '../../../i18n/config';
import { sections, sectionUrl } from '../../../i18n/routes';
import { t } from '../../../i18n/ui';
import { getNotes } from '../../../lib/notes';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang, notes: sections.notes[lang] } }));
}

export async function GET({ params, site }: APIContext) {
  const lang = params.lang as Locale;
  const ui = t(lang);
  const notes = await getNotes(lang);

  return rss({
    title: `${ui.pages.notes} · klykov.me`,
    description: ui.notes.intro,
    site: new URL(sectionUrl('notes', lang), site),
    customData: `<language>${lang}</language>`,
    items: notes.map(({ entry, url }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: url,
      categories: entry.data.tags.map((tag) => ui.tags[tag]),
    })),
  });
}
