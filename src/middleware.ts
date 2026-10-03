import { defineMiddleware } from 'astro:middleware';
import { verifySessionCookie } from '~/lib/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname.replace(/\/+$/, '') || '/';
  // Public contract endpoints verify their own scoped invitation token.
  const publicPaths = new Set([
    '/clients/login',
    '/api/login',
    '/api/logout',
    '/api/get_price',
    '/api/submit_contract',
  ]);
  if (publicPaths.has(pathname)) return next();

  const isApi = pathname === '/api' || pathname.startsWith('/api/');
  if (isApi || pathname === '/clients' || pathname.startsWith('/clients/')) {
    const validUser = await verifySessionCookie(context.cookies.get('session')?.value || '');
    if (!validUser) {
      context.cookies.delete('session', { path: '/' });
      if (isApi)
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      return context.redirect('/clients/login');
    }
  }
  const response = await next();
  if (isApi || pathname === '/clients' || pathname.startsWith('/clients/')) {
    // Response.redirect() has immutable headers. Copy them into a writable response.
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'private, no-store');
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  return response;
});
