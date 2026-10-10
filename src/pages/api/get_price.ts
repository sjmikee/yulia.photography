import { contractPresentation } from '../../lib/contract-presentation';
import { packageDurationLabel } from '../../lib/session-duration';
import { verifyContractToken } from '../../lib/contract-token';
import { getContractInvitation, invitationError } from '../../lib/contract-invitation';
import type { APIContext } from 'astro';

export const prerender = false;

export async function GET(context: APIContext) {
  const urlParams = new URL(context.request.url);
  const invitation = await verifyContractToken(urlParams.searchParams.get('token') || '');
  if (!invitation) return new Response(JSON.stringify({ error: 'Invalid or expired contract link' }), { status: 403 });

  const booking = await getContractInvitation(invitation);
  const unavailable = invitationError(booking);
  if (unavailable) return unavailable;

  return new Response(
    JSON.stringify({
      price: booking.session_price.toString(),
      duration: booking.package_type.toString(),
      duration_label: packageDurationLabel(booking.package_type, invitation.locale),
      phone: invitation.phone,
      conf: invitation.conf,
      locale: invitation.locale,
      contract_version: invitation.contractVersion,
      template: contractPresentation(invitation.locale, invitation.conf).template,
    }),
    {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    }
  );
}
