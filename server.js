const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = __dirname;
const PRIVATE_DIR = path.join(ROOT, '.server-data');
const UPLOAD_DIR = path.join(ROOT, 'uploads');
const LEADS_FILE = path.join(PRIVATE_DIR, 'leads.jsonl');
const PHOTOS_FILE = path.join(PRIVATE_DIR, 'photos.json');
const PORT = Number(process.env.PORT || 3000);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const sessions = new Map();
const limitBuckets = new Map();

const defaultPhotos = Object.freeze({
  hero: 'DSC01024.jpg',
  'menu-burger': 'DSC01024.jpg',
  'menu-nachos': 'DSC01130.jpg',
  'menu-wrap': 'DSC01064.jpg',
  story: 'DSC01175.jpg'
});
const allowedSlots = new Set(Object.keys(defaultPhotos));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp'
};

function send(res, status, body, headers = {}) {
  const data = Buffer.isBuffer(body) ? body : Buffer.from(body);
  res.writeHead(status, { 'Content-Length': data.length, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', ...headers });
  res.end(data);
}

function json(res, status, value, headers = {}) {
  send(res, status, JSON.stringify(value), { 'Content-Type': 'application/json; charset=utf-8', ...headers });
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > limit) {
        reject(Object.assign(new Error('Request is too large.'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readJson(req, limit = 32 * 1024) {
  const raw = await readBody(req, limit);
  try { return JSON.parse(raw.toString('utf8')); }
  catch { throw Object.assign(new Error('Please send valid form data.'), { status: 400 }); }
}

function safeEqual(left, right) {
  const a = crypto.createHash('sha256').update(String(left)).digest();
  const b = crypto.createHash('sha256').update(String(right)).digest();
  return crypto.timingSafeEqual(a, b);
}

function clientAddress(req) {
  return req.socket.remoteAddress || 'unknown';
}

function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const current = limitBuckets.get(key);
  if (!current || current.until <= now) {
    limitBuckets.set(key, { count: 1, until: now + windowMs });
    return true;
  }
  current.count += 1;
  return current.count <= max;
}

function assertSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return;
  const host = req.headers.host;
  const expected = `${req.socket.encrypted ? 'https' : 'http'}://${host}`;
  if (origin !== expected) throw Object.assign(new Error('Request origin was rejected.'), { status: 403 });
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map(part => {
    const index = part.indexOf('=');
    return index < 0 ? ['', ''] : [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }).filter(([key]) => key));
}

function sessionFor(req) {
  const token = cookies(req).lbs_admin;
  const session = token && sessions.get(token);
  if (!session || session.expires <= Date.now()) {
    if (token) sessions.delete(token);
    return null;
  }
  session.expires = Date.now() + SESSION_TTL_MS;
  return token;
}

function requireAdmin(req, res) {
  const token = sessionFor(req);
  if (!token) {
    json(res, 401, { error: 'Sign in to manage enquiries and photos.' });
    return false;
  }
  return true;
}

async function photoManifest() {
  try {
    const saved = JSON.parse(await fs.readFile(PHOTOS_FILE, 'utf8'));
    return { ...defaultPhotos, ...Object.fromEntries(Object.entries(saved).filter(([slot, file]) => allowedSlots.has(slot) && typeof file === 'string')) };
  } catch {
    return { ...defaultPhotos };
  }
}

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : '';
}

async function saveLead(body, req) {
  const name = cleanText(body.name, 100);
  const phone = cleanText(body.phone, 24);
  const email = cleanText(body.email, 254);
  const city = cleanText(body.city, 100);
  const message = cleanText(body.message, 1000);
  if (!name || !city || !/^[+\d().\-\s]{7,24}$/.test(phone) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || body.consent !== true) {
    throw Object.assign(new Error('Please check your name, mobile number, city and consent.'), { status: 400 });
  }
  const lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), name, phone, email, city, message, source: 'website' };
  await fs.appendFile(LEADS_FILE, `${JSON.stringify(lead)}\n`, { encoding: 'utf8', mode: 0o600 });
  return lead;
}

function validImage(buffer, mime) {
  if (mime === 'image/jpeg') return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === 'image/png') return buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return mime === 'image/webp' && buffer.length > 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
}

async function uploadPhoto(body) {
  const slot = cleanText(body.slot, 40);
  if (!allowedSlots.has(slot)) throw Object.assign(new Error('Choose a valid photo location.'), { status: 400 });
  const match = typeof body.dataUrl === 'string' && body.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) throw Object.assign(new Error('Upload a JPG, PNG or WebP image.'), { status: 400 });
  const mime = match[1];
  const image = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (!image.length || image.length > MAX_UPLOAD_BYTES || !validImage(image, mime)) {
    throw Object.assign(new Error('The image must be valid and no larger than 8 MB.'), { status: 400 });
  }
  const extension = mime === 'image/jpeg' ? 'jpg' : mime === 'image/png' ? 'png' : 'webp';
  const filename = `lovely-${slot.replace(/[^a-z0-9-]/gi, '-')}-${crypto.randomBytes(8).toString('hex')}.${extension}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), image, { flag: 'wx', mode: 0o644 });
  const photos = await photoManifest();
  photos[slot] = `uploads/${filename}`;
  await fs.writeFile(PHOTOS_FILE, JSON.stringify(photos, null, 2), { mode: 0o600 });
  return photos;
}

async function adminLeads() {
  try {
    const raw = await fs.readFile(LEADS_FILE, 'utf8');
    return raw.split('\n').filter(Boolean).map(line => JSON.parse(line)).reverse();
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

function allowedStaticPath(urlPath) {
  if (urlPath === '/') return 'index.html';
  const name = urlPath.replace(/^\//, '');
  if (/^(index|admin)\.html$/.test(name) || /^(main|admin)\.(js|css)$/.test(name) || name === 'style.css') return name;
  if (/^DSC\d{5}\.jpg$/i.test(name) || name === 'lovely-logo.png' || /^burger-[a-z-]+\.png$/.test(name)) return name;
  if (/^uploads\/lovely-[a-z0-9-]+\.(jpg|png|webp)$/i.test(name)) return name;
  return null;
}

async function serveStatic(urlPath, res) {
  const relative = allowedStaticPath(urlPath);
  if (!relative) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  const filePath = path.resolve(ROOT, relative);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) return send(res, 404, 'Not found');
  try {
    const content = await fs.readFile(filePath);
    send(res, 200, content, { 'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
  } catch {
    send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
  }
}

async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/api/photos') return json(res, 200, await photoManifest());
    if (req.method === 'POST' && url.pathname === '/api/leads') {
      if (!rateLimit(`lead:${clientAddress(req)}`, 10, 60 * 60 * 1000)) return json(res, 429, { error: 'Please try again later.' });
      const body = await readJson(req);
      if (cleanText(body.website, 200)) return json(res, 201, { ok: true });
      await saveLead(body, req);
      return json(res, 201, { ok: true });
    }
    if (req.method === 'GET' && url.pathname === '/api/admin/session') return requireAdmin(req, res) ? json(res, 200, { authenticated: true }) : undefined;
    if (req.method === 'POST' && url.pathname === '/api/admin/login') {
      assertSameOrigin(req);
      if (!rateLimit(`login:${clientAddress(req)}`, 6, 15 * 60 * 1000)) return json(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
      const body = await readJson(req);
      if (!ADMIN_PASSWORD || !safeEqual(body.password || '', ADMIN_PASSWORD)) return json(res, 401, { error: 'Password not recognised.' });
      const token = crypto.randomBytes(32).toString('hex');
      sessions.set(token, { expires: Date.now() + SESSION_TTL_MS });
      const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
      return json(res, 200, { authenticated: true }, { 'Set-Cookie': `lbs_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_MS / 1000}${secure}` });
    }
    if (req.method === 'POST' && url.pathname === '/api/admin/logout') {
      assertSameOrigin(req);
      const token = cookies(req).lbs_admin;
      if (token) sessions.delete(token);
      return json(res, 200, { ok: true }, { 'Set-Cookie': 'lbs_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0' });
    }
    if (req.method === 'GET' && url.pathname === '/api/admin/leads') {
      if (!requireAdmin(req, res)) return;
      return json(res, 200, await adminLeads());
    }
    if (req.method === 'GET' && url.pathname === '/api/admin/photos') {
      if (!requireAdmin(req, res)) return;
      return json(res, 200, await photoManifest());
    }
    if (req.method === 'POST' && url.pathname === '/api/admin/photos') {
      assertSameOrigin(req);
      if (!requireAdmin(req, res)) return;
      const body = await readJson(req, 12 * 1024 * 1024);
      return json(res, 200, await uploadPhoto(body));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json(res, 405, { error: 'Method not allowed.' });
    return serveStatic(url.pathname, res);
  } catch (error) {
    if (res.headersSent || res.destroyed) return;
    return json(res, error.status || 500, { error: error.status ? error.message : 'The request could not be completed.' });
  }
}

async function start() {
  await fs.mkdir(PRIVATE_DIR, { recursive: true, mode: 0o700 });
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const server = http.createServer((req, res) => { handle(req, res); });
  server.listen(PORT, () => console.log(`Lovely's site is available at http://localhost:${PORT}`));
}

start().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
