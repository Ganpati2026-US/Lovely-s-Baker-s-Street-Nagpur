import { getPublicPhotoMap } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json(await getPublicPhotoMap(), { headers: { 'Cache-Control': 'no-store' } });
}
