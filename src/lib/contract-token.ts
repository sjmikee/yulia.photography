import { signToken, verifyToken } from './signed-token';

export async function createContractToken(
  sessionId: number,
  phone: string,
  conf: string,
  invitationId: string,
  expiresAt: number,
  locale: 'he' | 'ru' = 'he'
) {
  return signToken({
    purpose: 'contract',
    sessionId,
    phone,
    conf,
    invitationId,
    expiresAt,
    locale,
    contractVersion: '1',
  });
}

export async function verifyContractToken(token: string) {
  const payload = await verifyToken(token, 'contract');
  if (
    !payload ||
    typeof payload.invitationId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.invitationId) ||
    !Number.isSafeInteger(payload.sessionId) ||
    Number(payload.sessionId) <= 0 ||
    typeof payload.phone !== 'string' ||
    !['0', '1'].includes(String(payload.conf))
  )
    return null;
  // Existing invitations predate localization and remain Hebrew. Partial or
  // unknown language/version claims are rejected rather than silently downgraded.
  const legacy = payload.locale === undefined && payload.contractVersion === undefined;
  if (
    !legacy &&
    (typeof payload.locale !== 'string' || !['he', 'ru'].includes(payload.locale) || payload.contractVersion !== '1')
  )
    return null;
  return {
    locale: (legacy ? 'he' : payload.locale) as 'he' | 'ru',
    contractVersion: '1',
    invitationId: payload.invitationId,
    sessionId: Number(payload.sessionId),
    phone: payload.phone,
    conf: String(payload.conf),
  };
}
