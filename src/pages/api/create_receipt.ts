export const prerender = false;

import { sql } from '../../lib/db.ts';

export async function POST({ request }: { request: Request }) {
  try {
    const { payment_id, payment, appType, description, remarks } = await request.json();
    if (
      typeof payment_id !== 'string' ||
      !/^[0-9a-f-]{36}$/i.test(payment_id) ||
      ![1, 4, 10].includes(payment) ||
      (payment === 10 && !['1', '3'].includes(String(appType))) ||
      typeof description !== 'string' ||
      !description.trim() ||
      description.length > 2000 ||
      (remarks != null && (typeof remarks !== 'string' || remarks.length > 2000))
    ) {
      return new Response(JSON.stringify({ error: 'Invalid receipt details' }), { status: 400 });
    }
    const [record] = await sql`SELECT p.*, p.paid_on::text AS paid_on, c.name, c.phone, c.email
      FROM session_payments p JOIN sessions s ON s.id = p.session_id
      JOIN clients c ON c.id = s.client_id WHERE p.id = ${payment_id}::uuid`;
    if (!record) return new Response(JSON.stringify({ error: 'Payment not found' }), { status: 404 });
    if (record.receipt_status === 'issued')
      return Response.json({ id: record.receipt_id, number: record.receipt_number, url: record.receipt_url });
    if (record.receipt_status !== 'pending')
      return new Response(JSON.stringify({ error: 'Check receipt status in Morning before retrying' }), {
        status: 409,
      });
    const { name, phone, email } = record;
    const amount = Number(record.amount);
    const paymentDate = String(record.paid_on).slice(0, 10);

    const tinyToken = import.meta.env.TINYTOKEN;
    const apiKey = import.meta.env.MORNINGAPIKEY;
    const apiSecret = import.meta.env.MORNINGAPISECRET;

    if (!apiKey || !apiSecret) {
      return new Response(JSON.stringify({ error: 'Missing Morning API keys' }), { status: 500 });
    }

    const jwt_body = {
      id: apiKey,
      secret: apiSecret,
    };

    const jwt_response = await fetch('https://api.greeninvoice.co.il/api/v1/account/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jwt_body),
    });

    const jwt_data = await jwt_response.json();

    if (!jwt_response.ok) {
      console.error('GreenInvoice API token error:', jwt_data);
      return new Response(JSON.stringify({ error: jwt_data }), { status: 401 });
    }

    const body = {
      description: description,
      remarks: remarks,
      type: 400, // שימוש ב-400 עבור קבלה
      lang: 'he',
      currency: 'ILS',
      vatType: 0,
      client: {
        name: name,
        emails: { email },
        phone: phone,
      },
      income: [
        {
          description: description,
          quantity: 1,
          price: amount,
          currency: 'ILS',
          vatType: 0,
        },
      ],
      payment: [
        {
          date: paymentDate,
          type: payment,
          price: amount,
          currency: 'ILS',
          ...(payment === 10 && appType ? { appType } : {}),
        },
      ],
    };

    // Claim before calling the provider. Unknown outcomes remain locked for manual reconciliation.
    const claimed = await sql`UPDATE session_payments SET receipt_status = 'processing'
      WHERE id = ${payment_id}::uuid AND receipt_status = 'pending' RETURNING id`;
    if (!claimed.length) return new Response(JSON.stringify({ error: 'Receipt already requested' }), { status: 409 });

    const response = await fetch('https://api.greeninvoice.co.il/api/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt_data.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GreenInvoice API error:', data);
      return new Response(JSON.stringify({ error: data }), { status: 400 });
    }

    // Payments already reduced this exact session's balance when recorded.
    // Store the provider result before optional URL shortening.
    await sql`UPDATE session_payments SET receipt_status = 'issued', receipt_id = ${String(data.id)},
      receipt_number = ${String(data.number)}, receipt_url = ${data.url.he}
      WHERE id = ${payment_id}::uuid AND receipt_status = 'processing'`;

    // --- TinyURL Shortening ---
    let shortUrl = data.url.he;
    try {
      if (tinyToken) {
        const tinyResponse = await fetch('https://api.tinyurl.com/create', {
          signal: AbortSignal.timeout(5000),
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tinyToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: data.url.he,
            domain: 'tinyurl.com',
          }),
        });

        const tinyData = await tinyResponse.json();

        if (tinyResponse.ok && tinyData.data && tinyData.data.tiny_url) {
          shortUrl = tinyData.data.tiny_url;
        } else {
          console.error('TinyURL API error:', tinyData);
        }
      }
    } catch (e) {
      console.error('TinyURL fetch error:', e);
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
      JSON.stringify({ error: 'Unable to confirm receipt outcome. Check Morning before retrying.' }),
      { status: 500 }
    );
  }
}
