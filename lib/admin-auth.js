import crypto from 'node:crypto';

const COOKIE_NAME = 'lbs_admin';
const TTL_SECONDS = 8 * 60 * 60;
const loginBuckets = new Map();

function signingSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function signature(expires) {
  return crypto.createHmac('sha256', signingSecret()).update(`lbs-admin:${expires}`).digest('base64url');
}

export function isAdminRequest(request) {
  if (!signingSecret() || !process.env.ADMIN_PASSWORD) return false;
  const raw = request.headers.get('cookie') || '';
  const token = raw.split(';').map(item => item.trim()).find(item => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!token) return false;
  let decoded;
  try { decoded = decodeURIComponent(token); } catch { return false; }
  const [expires, provided] = decoded.split('.');
  if (!/^\d+$/.test(expires || '') || Number(expires) < Date.now()) return false;
  const expected = signature(expires);
  const actualBytes = Buffer.from(provided || '');
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && crypto.timingSafeEqual(actualBytes, expectedBytes);
}

export function createSessionCookie() {
  const expires = String(Date.now() + TTL_SECONDS * 1000);
  return { name: COOKIE_NAME, value: `${expires}.${signature(expires)}`, maxAge: TTL_SECONDS };
}

export function clearSessionCookie() {
  return { name: COOKIE_NAME, value: '', maxAge: 0 };
}

export function adminCookieOptions(maxAge) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge };
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}

export function loginAllowed(request) {
  const host = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const bucket = loginBuckets.get(host);
  if (!bucket || bucket.until <= now) {
    loginBuckets.set(host, { count: 1, until: now + 15 * 60 * 1000 });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= 6;
}

export function safePasswordMatch(candidate) {
  const expected = process.env.ADMIN_PASSWORD || '';
  const a = crypto.createHash('sha256').update(String(candidate)).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return Boolean(expected) && crypto.timingSafeEqual(a, b);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
