import crypto from 'node:crypto';
import { isAdminRequest, sameOrigin } from '@/lib/admin-auth';
import { getPublicPhotoMap, isPhotoSlot, savePhoto } from '@/lib/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

function validImage(buffer, type) {
  if (type === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (type === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return type === 'image/webp' && buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
}

export async function GET(request) {
  if (!isAdminRequest(request)) return Response.json({ error: 'Sign in to manage enquiries and photos.' }, { status: 401 });
  return Response.json(await getPublicPhotoMap(), { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Request origin was rejected.' }, { status: 403 });
  if (!isAdminRequest(request)) return Response.json({ error: 'Sign in to manage enquiries and photos.' }, { status: 401 });
  try {
    const form = await request.formData();
    const slot = String(form.get('slot') || '');
    const file = form.get('file');
    if (!isPhotoSlot(slot) || !(file instanceof File)) return Response.json({ error: 'Choose a valid photo location and image.' }, { status: 400 });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > MAX_IMAGE_BYTES) return Response.json({ error: 'Choose a JPG, PNG or WebP image under 3 MB.' }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!validImage(bytes, file.type)) return Response.json({ error: 'The selected file is not a valid image.' }, { status: 400 });
    return Response.json(await savePhoto(slot, new File([bytes], `${slot}-${crypto.randomUUID()}`, { type: file.type })), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Could not save site photo:', error);
    return Response.json({ error: 'Photo storage is unavailable. Check the connected Vercel Blob store.' }, { status: 503 });
  }
}
