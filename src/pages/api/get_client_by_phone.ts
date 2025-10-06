export const prerender = false;

import { sql } from "../../lib/db.ts";

export async function POST({ request }: { request: Request }) {
  const { phone } = await request.json();
  if (!phone) return new Response(JSON.stringify({ error: "Missing phone" }), { status: 400 });

  try {
    const result = await sql`SELECT name FROM clients WHERE phone = ${phone} LIMIT 1;`;
    if (result.length === 0) return new Response(JSON.stringify({ error: "Client not found" }), { status: 404 });
    return new Response(JSON.stringify({ name: result[0].name }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Database error" }), { status: 500 });
  }
}