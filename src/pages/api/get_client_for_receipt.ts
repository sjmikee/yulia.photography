export const prerender = false;

import { sql } from "../../lib/db.ts";

export async function POST({ request }: { request: Request }) {
  try {
    const { phone } = await request.json();
    if (!phone)
      return new Response(
        JSON.stringify({ error: "Missing phone" }),
        { status: 400 }
      );

    // Normalize (רק ספרות)
    const normalized = phone.replace(/\D/g, "");

    const result =
      await sql`SELECT name, email, phone, id FROM clients WHERE phone = ${normalized} LIMIT 1;`;

    if (result.length === 0)
      return new Response(
        JSON.stringify({ error: "Client not found" }),
        { status: 404 }
      );

    return new Response(
      JSON.stringify({
        name: result[0].name,
        email: result[0].email,
        phone: result[0].phone,
        id: result[0].id
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Database error" }),
      { status: 500 }
    );
  }
}