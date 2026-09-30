// Límites del chat en KV (docs/chat-ia.md → "Límites"). Solo contadores anónimos; nunca la IP en claro.

export const USER_DAILY = 20;
export const GLOBAL_DAILY = 300;
const DAY = 60 * 60 * 24;

const today = () => new Date().toISOString().slice(0, 10);

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Sal aleatoria del día, guardada en KV: sin ella no se puede rehacer el hash de una IP. */
async function dailySalt(kv: KVNamespace, day: string): Promise<string> {
  const key = `salt:${day}`;
  const existing = await kv.get(key);
  if (existing) return existing;
  const salt = [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
  await kv.put(key, salt, { expirationTtl: 2 * DAY });
  return salt;
}

export type LimitResult = 'ok' | 'limit_user' | 'limit_global';

/**
 * Comprueba y cuenta un mensaje. KV no es atómico: con estos volúmenes basta.
 * Si se quedara corto, pasar a Durable Objects o al rate limiting de Cloudflare.
 */
export async function consume(kv: KVNamespace, ip: string): Promise<LimitResult> {
  const day = today();
  const userKey = `u:${day}:${await sha256(ip + (await dailySalt(kv, day)))}`;
  const globalKey = `g:${day}`;
  const [user, global] = await Promise.all([kv.get(userKey), kv.get(globalKey)]);
  const userCount = Number(user ?? 0);
  const globalCount = Number(global ?? 0);
  if (globalCount >= GLOBAL_DAILY) return 'limit_global';
  if (userCount >= USER_DAILY) return 'limit_user';
  await Promise.all([
    kv.put(userKey, String(userCount + 1), { expirationTtl: DAY }),
    kv.put(globalKey, String(globalCount + 1), { expirationTtl: DAY }),
  ]);
  return 'ok';
}
