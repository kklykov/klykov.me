import type { LocalizedText } from '../content.config';
import type { Locale } from './config';

/** Texto de un campo `localized`: un texto plano vale para todos los idiomas; si es { es, en }, el del idioma. */
export const localize = (value: LocalizedText, lang: Locale): string =>
  typeof value === 'string' ? value : value[lang];
