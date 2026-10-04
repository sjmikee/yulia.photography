import { sql } from './db';
import type { verifyContractToken } from './contract-token';

type Invitation = NonNullable<Awaited<ReturnType<typeof verifyContractToken>>>;

export async function getContractInvitation(invitation: Invitation) {
  const rows = await sql`
    SELECT i.status, i.expires_at, s.id, s.session_price, s.package_type
    FROM contract_invitations i
    JOIN sessions s ON s.id = i.session_id
    JOIN clients c ON c.id = s.client_id
    WHERE i.id = ${invitation.invitationId} AND i.session_id = ${invitation.sessionId}
      AND c.phone = ${invitation.phone} AND COALESCE(s.workflow->>'status', '') <> 'cancelled'`;
  return rows[0];
}

export function invitationError(row: Record<string, unknown> | undefined) {
  let code: string;
  if (!row) code = 'invalid';
  else if (row.status === 'signed') code = 'signed';
  else if (row.status === 'processing') code = 'processing';
  else if (row.status === 'revoked') code = 'revoked';
  else if (new Date(String(row.expires_at)).getTime() <= Date.now()) code = 'expired';
  else if (row.status !== 'pending') code = 'invalid';
  else return null;
  return new Response(JSON.stringify({ error: code, code }), {
    status: code === 'signed' || code === 'processing' ? 409 : 403,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}
