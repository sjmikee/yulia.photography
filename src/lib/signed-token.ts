const encoder = new TextEncoder();

async function getKey() {
  const secret = import.meta.env.SESSION_SECRET;
  if (!secret) throw new Error('Missing SESSION_SECRET environment variable');
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

export async function signToken(payload: Record<string, unknown>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = await crypto.subtle.sign('HMAC', await getKey(), encoder.encode(encoded));
  return `${encoded}.${Buffer.from(signature).toString('base64url')}`;
}

export async function verifyToken(token: string, purpose: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(),
      Buffer.from(parts[1], 'base64url'),
      encoder.encode(parts[0])
    );
    if (!valid) return null;
    const payload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (
      !payload ||
      payload.purpose !== purpose ||
      !Number.isSafeInteger(payload.expiresAt) ||
      payload.expiresAt <= Date.now()
    )
      return null;
    return payload;
  } catch {
    return null;
  }
}
