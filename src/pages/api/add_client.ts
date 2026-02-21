export const prerender = false;

import type { APIRoute } from "astro";
import { sql } from "../../lib/db.ts";

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const phoneRaw = formData.get("phone") as string;
  const email = formData.get("email") as string | null;

  // Clean non‑digit characters
  let phone = phoneRaw ? phoneRaw.replace(/\D/g, "") : "";

  // Normalize Israeli phone number: 972XXXXXXXXX → 0XXXXXXXXX
  if (phone.startsWith("972")) {
    phone = "0" + phone.slice(3);
  }

  // Basic input validation
  if (!name || !phone) {
    const msg = encodeURIComponent("נתונים לא תקינים");
    return new Response(null, {
      status: 303,
      headers: { Location: `/clients/add?error=${msg}` },
    });
  }

  // Validate Israeli format (must be 10 digits starting with 05)
  if (!/^05\d{8}$/.test(phone)) {
    const msg = encodeURIComponent("מספר טלפון לא תקין");
    return new Response(null, {
      status: 303,
      headers: { Location: `/clients/add?error=${msg}` },
    });
  }

  await sql`
    INSERT INTO clients (name, phone, email)
    VALUES (${name}, ${phone}, ${email})
  `;

  return new Response(null, {
    status: 303,
    headers: { Location: `/clients/add?success=1&phone=${phone}` },
  });
};