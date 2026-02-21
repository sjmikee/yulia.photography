import { sql } from "../../lib/db.ts";
import type { APIContext } from "astro";

export const prerender = false;

export async function GET(context: APIContext) {
  const urlParams = new URL(context.request.url);
  const phone = urlParams.searchParams.get("phone");
  if (!phone) {
    return new Response(JSON.stringify({ error: "Missing phone parameter" }), { status: 400 });
  }

  const result = await sql`
    SELECT s.session_price, s.package_type
    FROM clients c
    JOIN sessions s ON s.client_id = c.id
    WHERE c.phone = ${phone}
    ORDER BY s.id DESC
    LIMIT 1;
  `;

  if (result.length === 0) {
    return new Response(JSON.stringify({ error: "No booking found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ price: result[0].session_price.toString(), duration: result[0].package_type.toString() }), {
    headers: { "Content-Type": "application/json" },
  });
}