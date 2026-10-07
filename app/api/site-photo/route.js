import { getPhoto, isPhotoSlot } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const slot = new URL(request.url).searchParams.get('slot');
  if (!isPhotoSlot(slot)) return new Response('Not found', { status: 404 });
  try {
    const photo = await getPhoto(slot);
    if (!photo) return new Response('Not found', { status: 404 });
    if (photo.redirect) return Response.redirect(new URL(photo.redirect, request.url));
    return new Response(photo.body, { headers: { 'Content-Type': photo.contentType, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) {
    console.error('Could not load site photo:', error);
    return new Response('Photo storage is unavailable', { status: 503 });
  }
}
