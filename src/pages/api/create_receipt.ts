export const prerender = false;

import { sql } from '../../lib/db.ts';

export async function POST({ request }: { request: Request }) {
  let documentRequestStarted = false;
  let phase = 'payment lookup';
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
      return Response.json({ error: 'Missing Morning API keys', retryable: true }, { status: 500 });
    }

    const jwt_body = {
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret,
    };

    phase = 'Morning authentication';
    const jwt_response = await fetch('https://api.morning.co/idp/v1/oauth/token', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jwt_body),
    });

    // Gateways can return an empty or HTML error body. Preserve the HTTP status
    // instead of hiding it behind a JSON parse exception.
    const jwt_data = await jwt_response.json().catch(() => null);

    if (!jwt_response.ok) {
      console.error('Morning authentication failed:', jwt_response.status, jwt_data?.error);
      const reason =
        jwt_data?.error === 'invalid_client'
          ? 'Morning rejected the API key or secret. Check the Morning API credentials.'
          : jwt_data?.error === 'invalid_grant'
            ? 'The Morning API key is expired, revoked or awaiting activation.'
            : jwt_data?.error === 'unauthorized_client'
              ? 'The Morning account does not have an active subscription with API access.'
              : `Morning authentication failed (HTTP ${jwt_response.status}). Please try again later.`;
      return Response.json({ error: reason, retryable: true }, { status: 502 });
    }
    if (typeof jwt_data?.accessToken !== 'string' || !jwt_data.accessToken) {
      return Response.json({ error: 'Morning did not return an access token', retryable: true }, { status: 502 });
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
        emails: email ? [email] : [],
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
          ...(payment === 10 && appType ? { appType: Number(appType) } : {}),
        },
      ],
    };

    // Claim before calling the provider. Unknown outcomes remain locked for manual reconciliation.
    phase = 'payment claim';
    const claimed = await sql`UPDATE session_payments SET receipt_status = 'processing'
      WHERE id = ${payment_id}::uuid AND receipt_status = 'pending' RETURNING id`;
    if (!claimed.length) return new Response(JSON.stringify({ error: 'Receipt already requested' }), { status: 409 });

    documentRequestStarted = true;
    phase = 'Morning receipt creation';
    const response = await fetch('https://api.greeninvoice.co.il/api/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt_data.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('GreenInvoice API error:', data);
      // Explicit validation/auth rejections cannot create a document. Timeouts,
      // rate limits and server failures remain locked until reconciled in Morning.
      const retryable = [400, 401, 403, 404, 422].includes(response.status);
      if (retryable) {
        await sql`UPDATE session_payments SET receipt_status = 'pending'
          WHERE id = ${payment_id}::uuid AND receipt_status = 'processing'`;
      }
      return Response.json(
        {
          error: typeof data.errorMessage === 'string' ? data.errorMessage : 'Morning rejected the receipt request',
          retryable,
        },
        { status: 502 }
      );
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
    console.error(`Receipt failed during ${phase}:`, err);
    return new Response(
      JSON.stringify({
        error: documentRequestStarted
          ? 'Unable to confirm receipt outcome. Check Morning before retrying.'
          : phase === 'Morning authentication'
            ? 'Could not connect to Morning authentication. Please try again later.'
            : 'Could not read or update the saved payment. Please refresh the client profile and try again.',
        retryable: !documentRequestStarted,
      }),
      { status: 500 }
    );
  }
}
