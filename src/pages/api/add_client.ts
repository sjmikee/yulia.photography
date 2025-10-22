export const prerender = false;

import type { APIRoute } from "astro";
import { sql } from "../../lib/db.ts";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string | null;
  const price = parseFloat(formData.get("price") as string);
  const duration = parseInt(formData.get("duration") as string);

  if (!name || !phone || isNaN(price) || isNaN(duration)) {
    return new Response("Invalid input", { status: 400 });
  }

  await sql`
    INSERT INTO clients (name, phone, email, price, duration)
    VALUES (${name}, ${phone}, ${email}, ${price}, ${duration})
  `;

  // After adding, redirect back to form or to a "clients list" page
  return new Response(null, {
    status: 303,
    headers: { Location: "/clients/add?success=1" },
  });
};