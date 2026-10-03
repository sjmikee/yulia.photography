import { signToken, verifyToken } from './signed-token';

export async function createSessionCookie(username: string, remember = false) {
  const lifetime = (remember ? 30 * 24 : 2) * 60 * 60 * 1000;
  return signToken({ purpose: 'session', username, expiresAt: Date.now() + lifetime });
}

export async function verifySessionCookie(cookieValue: string) {
  const payload = await verifyToken(cookieValue, 'session');
  return typeof payload?.username === 'string' && payload.username ? payload.username : false;
}
