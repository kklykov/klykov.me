# klykov.me

Personal site of Klykov: notes, an AI lab and a timeline from HTML tables to AI.

It is built on one idea: **useful over pretty**. The site itself tries to prove it with fast pages, accessible markup and a stack that is pleasant to work with.

## Stack

- [Astro](https://astro.build) with content collections (Markdown and YAML)
- Plain CSS with custom properties and vanilla TypeScript, with no UI framework
- Hosted on Cloudflare, with a single on-demand endpoint for the AI chat
- Built day to day with [Claude Code](https://claude.com/claude-code)

## Development

Requires Node.js 22.12 or later.

```sh
npm install
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check code and content |

## Content

Notes and lab pieces live in `src/content/`, one folder per piece with one Markdown file per language (`es.md`, `en.md`). See `docs/contenido.md` for the content model (in Spanish).

## License

The source code will be released under the MIT license. Written content, images and videos are © Klykov, all rights reserved.
