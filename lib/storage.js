import { get, list, put } from '@vercel/blob';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PRIVATE_DIR = path.join(ROOT, '.server-data');
const UPLOAD_DIR = path.join(ROOT, 'public', 'uploads');
const PHOTOS_KEY = 'site/photos.json';
const DEFAULT_PHOTOS = {
  hero: '/DSC01024.jpg',
  'menu-burger': '/DSC01024.jpg',
  'menu-nachos': '/DSC01130.jpg',
  'menu-wrap': '/DSC01064.jpg',
  story: '/DSC01175.jpg',
};
const PHOTO_SLOTS = Object.keys(DEFAULT_PHOTOS);

function useVercelBlob() {
  return process.env.VERCEL === '1' || Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readPrivateBlob(pathname) {
  const result = await get(pathname, { access: 'private' });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).json();
}

export function isPhotoSlot(slot) {
  return PHOTO_SLOTS.includes(slot);
}

export async function getPhotoManifest() {
  if (useVercelBlob()) {
    const saved = await readPrivateBlob(PHOTOS_KEY).catch(() => null);
    const manifest = { ...DEFAULT_PHOTOS, ...(saved && typeof saved === 'object' ? saved : {}) };
    for (const slot of PHOTO_SLOTS) if (typeof manifest[slot] === 'string' && manifest[slot].startsWith('uploads/')) manifest[slot] = `/${manifest[slot]}`;
    return manifest;
  }
  try {
    const saved = JSON.parse(await fs.readFile(path.join(PRIVATE_DIR, 'photos.json'), 'utf8'));
    const manifest = { ...DEFAULT_PHOTOS, ...saved };
    for (const slot of PHOTO_SLOTS) if (typeof manifest[slot] === 'string' && manifest[slot].startsWith('uploads/')) manifest[slot] = `/${manifest[slot]}`;
    return manifest;
  } catch {
    return { ...DEFAULT_PHOTOS };
  }
}

export async function getPublicPhotoMap() {
  const manifest = await getPhotoManifest();
  return Object.fromEntries(PHOTO_SLOTS.map(slot => [
    slot,
    manifest[slot].startsWith('blob:') ? `/api/site-photo?slot=${slot}` : manifest[slot],
  ]));
}

export async function savePhoto(slot, file) {
  const bytes = Buffer.from(await file.arrayBuffer());
  const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
  const key = `site/photos-${slot}-${crypto.randomUUID()}.${extension}`;
  let savedPath;
  if (useVercelBlob()) {
    await put(key, bytes, { access: 'private', contentType: file.type, addRandomSuffix: false });
    savedPath = `blob:${key}`;
  } else {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${slot}-${crypto.randomUUID()}.${extension}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes, { flag: 'wx' });
    savedPath = `/uploads/${filename}`;
  }
  const manifest = await getPhotoManifest();
  manifest[slot] = savedPath;
  if (useVercelBlob()) {
    await put(PHOTOS_KEY, JSON.stringify(manifest), { access: 'private', contentType: 'application/json', allowOverwrite: true });
  } else {
    await fs.mkdir(PRIVATE_DIR, { recursive: true, mode: 0o700 });
    await fs.writeFile(path.join(PRIVATE_DIR, 'photos.json'), JSON.stringify(manifest, null, 2), { mode: 0o600 });
  }
  return getPublicPhotoMap();
}

export async function getPhoto(slot) {
  const manifest = await getPhotoManifest();
  const location = manifest[slot];
  if (!location) return null;
  if (location.startsWith('blob:')) {
    const result = await get(location.slice(5), { access: 'private' });
    if (!result || result.statusCode !== 200) return null;
    return { body: result.stream, contentType: result.blob.contentType };
  }
  if (location.startsWith('/uploads/')) {
    const filename = path.basename(location);
    const file = await fs.readFile(path.join(UPLOAD_DIR, filename)).catch(() => null);
    if (!file) return null;
    const extension = path.extname(filename).toLowerCase();
    return { body: file, contentType: extension === '.png' ? 'image/png' : extension === '.webp' ? 'image/webp' : 'image/jpeg' };
  }
  return { redirect: location };
}

export async function saveLead(lead) {
  const pathname = `leads/${lead.createdAt.slice(0, 10)}/${lead.id}.json`;
  const serialized = JSON.stringify(lead);
  if (useVercelBlob()) {
    await put(pathname, serialized, { access: 'private', contentType: 'application/json', addRandomSuffix: false });
    return;
  }
  const directory = path.join(PRIVATE_DIR, 'leads', lead.createdAt.slice(0, 10));
  await fs.mkdir(directory, { recursive: true, mode: 0o700 });
  await fs.writeFile(path.join(directory, `${lead.id}.json`), serialized, { flag: 'wx', mode: 0o600 });
}

export async function getLeads() {
  if (useVercelBlob()) {
    const { blobs } = await list({ prefix: 'leads/', limit: 1000 });
    const leads = await Promise.all(blobs.map(async blob => {
      const saved = await readPrivateBlob(blob.pathname);
      return saved;
    }));
    return leads.filter(Boolean).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  const root = path.join(PRIVATE_DIR, 'leads');
  const leads = [];
  async function visit(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(target);
      else if (entry.isFile() && entry.name.endsWith('.json')) {
        try { leads.push(JSON.parse(await fs.readFile(target, 'utf8'))); } catch { /* Ignore malformed records. */ }
      }
    }
  }
  await visit(root);
  const legacyFile = path.join(PRIVATE_DIR, 'leads.jsonl');
  const legacy = await fs.readFile(legacyFile, 'utf8').catch(() => '');
  for (const line of legacy.split('\n').filter(Boolean)) {
    try { leads.push(JSON.parse(line)); } catch { /* Ignore malformed records. */ }
  }
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const DEFAULT_PHOTO_SLOTS = PHOTO_SLOTS;
