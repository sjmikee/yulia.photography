export const prerender = false;

import type { APIRoute } from "astro";
import { sql } from "../../lib/db.ts";
import { PRICES } from "../../lib/pricing"; // your single source of truth

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const clientIdRaw = formData.get("client_id");
  const sessionType = formData.get("session_type") as string;
  const packageTypeRaw = formData.get("package_type");
  const phone = formData.get("phone") as string;
  const additionalPriceRaw = formData.get("additional_price");

  const client_id = Number(clientIdRaw);
  const package_type = Number(packageTypeRaw);
  const additional_price = Number(additionalPriceRaw ?? 0);

  // Basic validation
  if (!client_id || !sessionType || !package_type || !Number.isFinite(additional_price) || additional_price < 0) {
    const msg = encodeURIComponent("נתונים לא תקינים");
    return new Response(null, {
      status: 303,
      headers: { Location: `/clients/add_session?error=${msg}` },
    });
  }

  // Get price ONLY from central config (never trust form price)
  const session_price =
    PRICES?.[sessionType]?.[package_type] ?? null;

  if (!session_price) {
    const msg = encodeURIComponent("מחיר לא נמצא");
    return new Response(null, {
      status: 303,
      headers: { Location: `/clients/add_session?error=${msg}` },
    });
  }

  const total_price = session_price + additional_price;
  const to_pay = total_price;

  await sql`
    INSERT INTO sessions (
      client_id,
      session_type,
      package_type,
      session_price,
      to_pay
    )
    VALUES (
      ${client_id},
      ${sessionType},
      ${package_type},
      ${total_price},
      ${to_pay}
    )
  `;

  return new Response(null, {
    status: 303,
    headers: { Location: `/clients/add_session?success=1&phone=${phone}` },
  });
};
