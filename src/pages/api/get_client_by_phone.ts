export const prerender = false;

import { sql } from '../../lib/db.ts';

export async function POST({ request }: { request: Request }) {
  const { phone, include_sessions } = await request.json();
  if (!phone) return new Response(JSON.stringify({ error: 'Missing phone' }), { status: 400 });

  try {
    // Fetch optional sessions in the same round trip as the selected client.
    const result =
      include_sessions === true
        ? await sql`SELECT c.id, c.name, c.email,
          COALESCE((SELECT json_agg(s ORDER BY s.id DESC) FROM (
            SELECT id, session_type, package_type, workflow FROM sessions WHERE client_id = c.id
          ) s), '[]'::json) AS sessions
          FROM clients c WHERE c.phone = ${phone} ORDER BY c.id DESC LIMIT 1`
        : await sql`SELECT id, name, email FROM clients WHERE phone = ${phone} ORDER BY id DESC LIMIT 1`;
    if (!result.length) return Response.json({ error: 'Client not found' }, { status: 404 });
    return Response.json(result[0]);
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}
