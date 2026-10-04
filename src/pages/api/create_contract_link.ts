export const prerender = false;
import type { APIRoute } from 'astro';
import { sql } from '../../lib/db';
import { createContractToken } from '../../lib/contract-token';

export const POST: APIRoute = async ({ request, url }) => {
  try {
    const { phone, conf, session_id } = await request.json();
    if (typeof phone !== 'string' || !/^05\d{8}$/.test(phone) || !['0', '1'].includes(conf)) {
      return new Response(JSON.stringify({ error: 'Invalid details' }), { status: 400 });
    }
    if (session_id !== undefined && (!Number.isSafeInteger(Number(session_id)) || Number(session_id) < 1))
      return new Response('Invalid session', { status: 400 });
    const rows = await sql`SELECT s.id FROM sessions s JOIN clients c ON c.id = s.client_id
      WHERE COALESCE(s.workflow->>'status', '') <> 'cancelled' AND c.phone = ${phone} AND (${session_id == null} OR s.id = ${Number(session_id) || 0}) ORDER BY s.id DESC LIMIT 1`;
    if (!rows.length) return new Response(JSON.stringify({ error: 'No booking found' }), { status: 404 });
    const sessionId = Number(rows[0].id);
    // Serialize link issuance per booking. Never replace a submission whose email outcome is uncertain.
    const results = await sql.transaction([
      sql`SELECT id FROM sessions WHERE id = ${sessionId} FOR UPDATE`,
      sql`UPDATE contract_invitations SET status = 'revoked'
          WHERE session_id = ${sessionId} AND status = 'pending'`,
      sql`INSERT INTO contract_invitations (session_id)
          SELECT ${sessionId} WHERE EXISTS (SELECT 1 FROM sessions WHERE id = ${sessionId} AND COALESCE(workflow->>'status', '') <> 'cancelled') AND NOT EXISTS (
            SELECT 1 FROM contract_invitations WHERE session_id = ${sessionId} AND status = 'processing'
          ) RETURNING id, expires_at`,
    ]);
    const invitation = results[2][0];
    if (!invitation)
      return new Response(
        JSON.stringify({ error: 'A contract is processing. Check its delivery before issuing another link.' }),
        { status: 409 }
      );
    const link = new URL('/contract', url.origin);
    link.searchParams.set(
      'token',
      await createContractToken(sessionId, phone, conf, invitation.id, new Date(invitation.expires_at).getTime())
    );
    await sql`UPDATE sessions SET workflow = workflow || ${JSON.stringify({ contract_prepared: new Date().toISOString() })}::jsonb WHERE id = ${sessionId}`;
    return new Response(JSON.stringify({ url: link.toString() }), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Contract link error:', error);
    return new Response(JSON.stringify({ error: 'Unable to create contract link' }), { status: 500 });
  }
};
