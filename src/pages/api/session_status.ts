export const prerender = false;
import type { APIRoute } from 'astro';
import { sql } from '~/lib/db';
import { validId } from '~/lib/client-workflow';
export const GET: APIRoute = async ({ url }) => {
  let id: number;
  try {
    id = validId(url.searchParams.get('session_id'));
  } catch {
    return Response.json({ error: 'Invalid session' }, { status: 400 });
  }
  try {
    const [session] = await sql`SELECT contract_signed FROM sessions WHERE id = ${id}`;
    if (!session) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json(
      { signed: session.contract_signed === true },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch {
    return Response.json({ error: 'Unavailable' }, { status: 503 });
  }
};
