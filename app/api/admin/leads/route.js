import { isAdminRequest } from '@/lib/admin-auth';
import { getLeads } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  if (!isAdminRequest(request)) return Response.json({ error: 'Sign in to manage enquiries and photos.' }, { status: 401 });
  try { return Response.json(await getLeads(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    console.error('Could not load enquiries:', error);
    return Response.json({ error: 'Enquiry storage is unavailable.' }, { status: 503 });
  }
}
