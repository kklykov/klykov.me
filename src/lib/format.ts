const pad = (n: number) => String(n).padStart(2, '0');

/** 01.10.2026 */
export const formatDate = (date: Date) =>
  `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}`;

/** 2026-10-01, para `<time datetime>` */
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

/** 8 → 0:08 */
export const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}:${pad(Math.round(seconds % 60))}`;

/** 1 → 01 */
export const twoDigits = pad;
