export const prerender = false;
import type { APIRoute } from 'astro';
import { sql } from '~/lib/db';
import { durationOptions } from '~/lib/session-duration';
import { manualSteps, stepsFor, safeWebUrl, validId, validScheduled, clientDetails } from '~/lib/client-workflow';

export const POST: APIRoute = async ({ request, url }) => {
  let clientId: number;
  try {
    const form = await request.formData();
    clientId = validId(form.get('client_id'));
    const action = form.get('action');
    if (action === 'client_details') {
      if (form.get('confirm') !== '1') throw new Error('Confirmation required');
      const { name, phone, email } = clientDetails(form);
      const updated = await sql`UPDATE clients SET name = ${name}, phone = ${phone}, email = ${email}
        WHERE id = ${clientId} AND NOT EXISTS (SELECT 1 FROM clients WHERE phone = ${phone} AND id <> ${clientId})
        RETURNING id`;
      if (!updated.length)
        return new Response('לא ניתן לשמור: הלקוח לא נמצא או שמספר הטלפון כבר משויך ללקוח אחר.', { status: 409 });
    } else if (action === 'notes') {
      const notes = String(form.get('notes') || '');
      if (notes.length > 10000) throw new Error('Notes too long');
      await sql`UPDATE clients SET notes = ${notes} WHERE id = ${clientId}`;
    } else {
      const sessionId = validId(form.get('session_id'));
      const rows = await sql`SELECT id, workflow FROM sessions WHERE id = ${sessionId} AND client_id = ${clientId}`;
      if (!rows.length) return new Response('Session not found', { status: 404 });
      if (
        rows[0].workflow?.status === 'cancelled' &&
        !['restore', 'calendar_updated', 'receipt_done'].includes(String(action))
      )
        return new Response('הסשן בוטל. יש להחזירו לפעילות לפני עדכון.', { status: 409 });
      if (action === 'cancel' || action === 'restore') {
        if (form.get('confirm') !== '1') throw new Error('Confirmation required');
        const reason = String(form.get('reason') || '').trim();
        if (reason.length > 1000 || (action === 'cancel' && !reason)) throw new Error('Cancellation reason required');
        const patch =
          action === 'cancel'
            ? {
                status: 'cancelled',
                cancelled_at: new Date().toISOString(),
                cancellation_reason: reason,
                calendar_needs_update: '1',
              }
            : { status: 'active', restored_at: new Date().toISOString(), calendar_needs_update: '1' };
        await sql`UPDATE sessions SET workflow = COALESCE(workflow, '{}'::jsonb) || ${JSON.stringify(patch)}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'calendar_updated') {
        await sql`UPDATE sessions SET workflow = workflow || '{"calendar_needs_update":"0"}'::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'reschedule') {
        const scheduled = String(form.get('scheduled') || '');
        if (form.get('confirm') !== '1' || !validScheduled(scheduled)) throw new Error('Invalid schedule');
        const updated = await sql`UPDATE sessions SET workflow = workflow || jsonb_build_object(
          'previous_scheduled', workflow->>'scheduled', 'scheduled', ${scheduled}::text,
          'rescheduled_at', ${new Date().toISOString()}::text, 'calendar_needs_update', '1')
          WHERE id = ${sessionId} AND COALESCE(workflow->>'scheduled', '') = ${String(form.get('previous_scheduled') || '')}
          AND COALESCE(workflow->>'status', '') <> 'cancelled' RETURNING id`;
        if (!updated.length) return new Response('מועד הסשן השתנה. רענני ובדקי לפני ניסיון נוסף.', { status: 409 });
      } else if (action === 'correction') {
        const key = String(form.get('step'));
        const done = form.get('done');
        if (!stepsFor({ to_pay: 1 }, []).some((step) => step.key === key) || !['0', '1'].includes(String(done)))
          throw new Error('Invalid correction');
        await sql`UPDATE sessions SET workflow = COALESCE(workflow, '{}'::jsonb) || ${JSON.stringify({ [`override_${key}`]: done })}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'step') {
        const key = String(form.get('step'));
        if (!manualSteps.some(([k]) => k === key)) throw new Error('Invalid step');
        const value = form.get('done') === '1' ? new Date().toISOString() : null;
        await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify({ [key]: value, [`override_${key}`]: null })}::jsonb WHERE id = ${sessionId}`;
      } else if (action === 'details') {
        const scheduled = String(form.get('scheduled') || '');
        if (scheduled && !validScheduled(scheduled)) throw new Error('Invalid date');
        const duration = Number(form.get('duration'));
        if (!durationOptions.includes(duration)) throw new Error('Invalid duration');
        const location = String(form.get('location') || '').slice(0, 500);
        const notes = String(form.get('notes') || '').slice(0, 10000);
        const pixieset = safeWebUrl(form.get('pixieset'));
        const details = { duration: String(duration), location, notes, pixieset };
        if (form.has('scheduled')) {
          await sql`UPDATE sessions SET workflow = workflow || CASE
            WHEN COALESCE(workflow->>'scheduled', '') <> '' AND workflow->>'scheduled' IS DISTINCT FROM ${scheduled}::text
            THEN jsonb_build_object('previous_scheduled', workflow->>'scheduled', 'rescheduled_at', ${new Date().toISOString()}::text, 'calendar_needs_update', '1')
            ELSE '{}'::jsonb END || ${JSON.stringify({ ...details, scheduled })}::jsonb WHERE id = ${sessionId}`;
        } else {
          await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify(details)}::jsonb WHERE id = ${sessionId}`;
        }
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
          SELECT id, to_pay FROM sessions WHERE id = ${sessionId} AND COALESCE(workflow->>'status', '') <> 'cancelled' FOR UPDATE
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
