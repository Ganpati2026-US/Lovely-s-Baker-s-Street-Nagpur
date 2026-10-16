import { isAdminRequest } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!isAdminRequest(request)) return Response.json({ error: 'Sign in to manage enquiries and photos.' }, { status: 401 });
  return Response.json({ authenticated: true }, { headers: { 'Cache-Control': 'no-store' } });
}
