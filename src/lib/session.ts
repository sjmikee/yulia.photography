// src/lib/session.ts
export const prerender = false;

const encoder = new TextEncoder();

const SESSION_SECRET = import.meta.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  throw new Error("Missing SESSION_SECRET environment variable");
}

const SECRET_KEY = encoder.encode(SESSION_SECRET);

async function getKey() {
  return await crypto.subtle.importKey(
    "raw",
    SECRET_KEY,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionCookie(username: string) {
  // Prepare UTF-8 session payload safely
  const sessionData = `${username}:${Date.now()}`;
  const sessionPayload = Buffer.from(sessionData, "utf8").toString("base64url");

  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(sessionPayload));
  const sigBase64 = Buffer.from(signature).toString("base64url");

  return `${sessionPayload}.${sigBase64}`;
}

export async function verifySessionCookie(cookieValue: string) {
  if (!cookieValue) return false;
  const [sessionPayload, sigBase64] = cookieValue.split(".");
  if (!sessionPayload || !sigBase64) return false;

  const key = await getKey();
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    Buffer.from(sigBase64, "base64url"),
    encoder.encode(sessionPayload)
  );

  if (!valid) return false;

  // Decode UTF-8 back to readable username
  const decoded = Buffer.from(sessionPayload, "base64url").toString("utf8");
  const [username] = decoded.split(":");
  return username;
}