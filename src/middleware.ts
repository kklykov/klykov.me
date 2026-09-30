// Con el Worker de /api/chat, las rutas inexistentes llegan a Astro en vez de a los assets.
// Se devuelven a los assets de Cloudflare, que sirven la 404 más cercana (/404.html o /en/404.html).
import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const skip = context.isPrerendered || import.meta.env.DEV || context.url.pathname.startsWith('/api/');
  if (response.status !== 404 || skip) return response;
  const { env } = await import('cloudflare:workers');
  return env.ASSETS.fetch(context.request);
});
