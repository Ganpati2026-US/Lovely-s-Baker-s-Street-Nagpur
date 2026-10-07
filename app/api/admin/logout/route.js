import { NextResponse } from 'next/server';
import { adminCookieOptions, clearSessionCookie, sameOrigin } from '@/lib/admin-auth';

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Request origin was rejected.' }, { status: 403 });
  const cookie = clearSessionCookie();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie.name, cookie.value, adminCookieOptions(cookie.maxAge));
  return response;
}
