export const prerender = false;

import { sql } from '../../lib/db.ts';

export async function POST({ request }: { request: Request }) {
  const { phone, include_sessions } = await request.json();
  if (!phone) return new Response(JSON.stringify({ error: 'Missing phone' }), { status: 400 });

  try {
    const result = await sql`SELECT id, name, email FROM clients WHERE phone = ${phone} ORDER BY id DESC LIMIT 1;`;
    if (result.length === 0) return new Response(JSON.stringify({ error: 'Client not found' }), { status: 404 });
    const sessions =
      include_sessions === true
        ? await sql`SELECT id, session_type, package_type, workflow FROM sessions WHERE client_id = ${result[0].id} ORDER BY id DESC`
        : undefined;
    return new Response(JSON.stringify({ sessions, id: result[0].id, name: result[0].name, email: result[0].email }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500 });
  }
}
