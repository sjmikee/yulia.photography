export const prerender = false;

import { sql } from "../../lib/db.ts";

export async function POST({ request }: { request: Request }) {
  try {
    const {
      phone,
      name,
      email,
      amount,
      payment,
      appType,
      paymentDate,
      description,
      remarks
    } = await request.json();

    if (!phone || !name || !amount || !payment || !description || !paymentDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const tinyToken = import.meta.env.TINYTOKEN;
    const apiKey = import.meta.env.MORNINGAPIKEY;
    const apiSecret = import.meta.env.MORNINGAPISECRET;

    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ error: "Missing Morning API keys" }),
        { status: 500 }
      );
    }

    const jwt_body = {
        id: apiKey,
        secret: apiSecret
    };

    const jwt_response = await fetch(
      "https://api.greeninvoice.co.il/api/v1/account/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jwt_body),
      }
    );

    const jwt_data = await jwt_response.json();

    if (!jwt_response.ok) {
      console.error("GreenInvoice API token error:", jwt_data);
      return new Response(JSON.stringify({ error: jwt_data }), { status: 401 });
    }

    const body = {
        description: description,
        remarks: remarks,
        type: 400, // שימוש ב-400 עבור קבלה
        lang: "he",
        currency: "ILS",
        vatType: 0,
        client: {
            name: name,
            emails: { email, },
            phone: phone
        },
        income: [
            {
            description: description,
            quantity: 1,
            price: amount,
            currency: "ILS",
            vatType: 0
            }
        ],
        payment: [
            {
            date: paymentDate,
            type: payment,
            price: amount,
            currency: "ILS",
            ...(payment === 10 && appType ? { appType } : {})
            }
        ]
    };

    const response = await fetch(
      "https://api.greeninvoice.co.il/api/v1/documents",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt_data.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("GreenInvoice API error:", data);
      return new Response(JSON.stringify({ error: data }), { status: 400 });
    }

    // --- Update session remaining balance (to_pay = to_pay - amount) ---
    try {
      await sql`
        UPDATE sessions s
        SET to_pay = GREATEST(s.to_pay - ${amount}, 0)
        FROM clients c
        WHERE s.client_id = c.id
          AND c.phone = ${phone}
          AND s.id = (
            SELECT s2.id
            FROM sessions s2
            WHERE s2.client_id = c.id
            ORDER BY s2.id DESC
            LIMIT 1
          );
      `;
    } catch (dbErr) {
      console.error("Session balance update error:", dbErr);
    }

    // --- TinyURL Shortening ---
    let shortUrl = data.url.he;
    try {
      const tinyResponse = await fetch("https://api.tinyurl.com/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tinyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url.he,
          domain: "tinyurl.com"
        })
      });

      const tinyData = await tinyResponse.json();

      if (tinyResponse.ok && tinyData.data && tinyData.data.tiny_url) {
        shortUrl = tinyData.data.tiny_url;
      } else {
        console.error("TinyURL API error:", tinyData);
      }
    } catch (e) {
      console.error("TinyURL fetch error:", e);
    }

    return new Response(
      JSON.stringify({
        id: data.id,
        number: data.number,
        url: shortUrl,
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Server error", details: err.message }),
      { status: 500 }
    );
  }
}