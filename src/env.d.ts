// Tipos mínimos del Worker para /api/chat (sin el runtime completo de Workers, que choca con el DOM).
// Si cambian los bindings de wrangler.jsonc, actualiza también esto.

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

declare namespace Cloudflare {
  interface Env {
    /** Contadores anónimos de los límites del chat. */
    RATE_LIMIT: KVNamespace;
    /** Secreto de Cloudflare. En local, en .dev.vars. */
    ANTHROPIC_API_KEY?: string;
    /** Archivos estáticos del build (lo añade el adaptador). */
    ASSETS: { fetch(request: Request): Promise<Response> };
  }
}

declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env;
}
