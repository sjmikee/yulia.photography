export const prerender = false;
import type { APIRoute } from 'astro';
import { sql } from '~/lib/db';
import { manualSteps, safeWebUrl, validId } from '~/lib/client-workflow';

export const POST: APIRoute = async ({ request, url }) => {
  let clientId: number;
  try {
    const form = await request.formData();
    clientId = validId(form.get('client_id'));
    const action = form.get('action');
    if (action === 'notes') {
      const notes = String(form.get('notes') || '');
      if (notes.length > 10000) throw new Error('Notes too long');
      await sql`UPDATE clients SET notes = ${notes} WHERE id = ${clientId}`;
    } else {
      const sessionId = validId(form.get('session_id'));
      const rows = await sql`SELECT id FROM sessions WHERE id = ${sessionId} AND client_id = ${clientId}`;
      if (!rows.length) return new Response('Session not found', { status: 404 });
      if (action === 'step') {
        const key = String(form.get('step'));
        if (!manualSteps.some(([k]) => k === key)) throw new Error('Invalid step');
        const value = form.get('done') === '1' ? new Date().toISOString() : null;
        await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify({ [key]: value })}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'details') {
        const scheduled = String(form.get('scheduled') || '');
        if (
          scheduled &&
          (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(scheduled) || !Number.isFinite(Date.parse(scheduled)))
        )
          throw new Error('Invalid date');
        const duration = Number(form.get('duration'));
        if (![1, 2, 3, 6, 9].includes(duration)) throw new Error('Invalid duration');
        const location = String(form.get('location') || '').slice(0, 500);
        const notes = String(form.get('notes') || '').slice(0, 10000);
        const pixieset = safeWebUrl(form.get('pixieset'));
        await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify({ scheduled, duration: String(duration), location, notes, pixieset })}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'delivery') {
        const pixieset = safeWebUrl(form.get('pixieset'));
        if (!pixieset) throw new Error('Missing gallery');
        await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify({ pixieset, delivery_prepared: new Date().toISOString() })}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'receipt_done') {
        const stage = String(form.get('stage'));
        if (!['deposit', 'balance'].includes(stage)) throw new Error('Invalid stage');
        // Never overwrite an in-flight provider request or an existing receipt.
        await sql`UPDATE session_payments SET receipt_status = 'issued'
          WHERE session_id = ${sessionId} AND stage = ${stage} AND receipt_status = 'pending'`;
      } else if (action === 'payment') {
        const stage = form.get('stage');
        const amount = Number(form.get('amount'));
        const paidOn = String(form.get('paid_on'));
        if (
          !['deposit', 'balance'].includes(String(stage)) ||
          !Number.isFinite(amount) ||
          amount <= 0 ||
          Math.round(amount * 100) / 100 !== amount ||
          (stage === 'deposit' && amount !== 100) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(paidOn) ||
          !Number.isFinite(Date.parse(paidOn))
        )
          throw new Error('Invalid payment');
        const receiptStatus = form.get('continue') === 'done' ? 'issued' : 'pending';
        // A row lock and a single atomic statement prevent duplicate deductions and overpayment.
        const inserted = await sql`WITH locked AS (
          SELECT id, to_pay FROM sessions WHERE id = ${sessionId} FOR UPDATE
        ), payment AS (
          INSERT INTO session_payments(session_id, stage, amount, paid_on, receipt_status)
          SELECT id, ${stage}, ${amount}, ${paidOn}::date, ${receiptStatus} FROM locked
          WHERE to_pay >= ${amount} AND (${stage} = 'deposit' OR to_pay = ${amount})
          ON CONFLICT(session_id, stage) DO NOTHING RETURNING session_id, amount
        ) UPDATE sessions s SET to_pay = s.to_pay - p.amount FROM payment p
          WHERE s.id = p.session_id RETURNING s.id`;
        if (!inserted.length)
          return Response.redirect(new URL(`/clients/${clientId}?error=payment#session-${sessionId}`, url), 303);
        if (form.get('continue') === 'receipt') {
          const [payment] =
            await sql`SELECT id FROM session_payments WHERE session_id = ${sessionId} AND stage = ${stage}`;
          if (payment) return Response.redirect(new URL(`/clients/send_reciept?payment_id=${payment.id}`, url), 303);
        }
      } else throw new Error('Invalid action');
      if (request.headers.get('Accept') === 'application/json') return Response.json({ saved: true });
      return Response.redirect(new URL(`/clients/${clientId}#session-${sessionId}`, url), 303);
    }
    return Response.redirect(new URL(`/clients/${clientId}`, url), 303);
  } catch (error) {
    console.error('Client workflow update failed', error);
    return new Response('לא ניתן לשמור. חזרי לפרופיל, רענני ובדקי את הנתונים לפני ניסיון נוסף.', { status: 400 });
  }
};
