import type { ShikiConfig } from 'astro';

type Theme = Exclude<NonNullable<ShikiConfig['theme']>, string>;
type Transformer = NonNullable<ShikiConfig['transformers']>[number];

/** Tema de Shiki con los colores del diseño. Los valores son los tokens --code-* de tokens.css. */
export const codeTheme: Theme = {
  name: 'klykov',
  type: 'dark',
  colors: {
    'editor.foreground': 'var(--code-text)',
    'editor.background': 'var(--surface)',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: 'var(--code-comment)' },
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'variable.language'],
      settings: { foreground: 'var(--code-keyword)' },
    },
    {
      scope: ['string', 'string.template', 'punctuation.definition.string', 'constant.numeric', 'constant.language'],
      settings: { foreground: 'var(--code-string)' },
    },
  ],
};

/**
 * Envuelve cada bloque en `.code-block` con una cabecera: el nombre de archivo
 * (```js title="regla.js") o, si no hay, el lenguaje. El botón de copiar lo añade el JS.
 */
export const codeFrame: Transformer = {
  name: 'code-frame',
  root(root) {
    const [pre] = root.children;
    if (pre?.type !== 'element') return;
    const title = /title="([^"]+)"/.exec(this.options.meta?.__raw ?? '')?.[1] ?? this.options.lang;
    root.children = [
      {
        type: 'element',
        tagName: 'div',
        properties: { class: 'code-block' },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { class: 'code-head' },
            children: [{ type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: title }] }],
          },
          pre,
        ],
      },
    ];
  },
};
