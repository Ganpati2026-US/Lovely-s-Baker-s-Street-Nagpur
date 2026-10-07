import { NextResponse } from 'next/server';
import { adminCookieOptions, createSessionCookie, loginAllowed, safePasswordMatch, sameOrigin } from '@/lib/admin-auth';

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Request origin was rejected.' }, { status: 403 });
  if (!loginAllowed(request)) return Response.json({ error: 'Too many attempts. Try again in a few minutes.' }, { status: 429 });
  let password = '';
  try { password = (await request.json()).password || ''; } catch { return Response.json({ error: 'Please send valid form data.' }, { status: 400 }); }
  if (!process.env.ADMIN_PASSWORD) return Response.json({ error: 'Admin access is not configured on this deployment.' }, { status: 503 });
  if (!safePasswordMatch(password)) return Response.json({ error: 'Password not recognised.' }, { status: 401 });
  const cookie = createSessionCookie();
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(cookie.name, cookie.value, adminCookieOptions(cookie.maxAge));
  return response;
}
