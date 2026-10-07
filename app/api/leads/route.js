import crypto from 'node:crypto';
import { saveLead } from '@/lib/storage';

export const runtime = 'nodejs';

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : '';
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (cleanText(body.website, 200)) return Response.json({ ok: true }, { status: 201 });
    const name = cleanText(body.name, 100);
    const phone = cleanText(body.phone, 24);
    const email = cleanText(body.email, 254);
    const city = cleanText(body.city, 100);
    const message = cleanText(body.message, 1000);
    if (!name || !city || !/^[+\d().\-\s]{7,24}$/.test(phone) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) || body.consent !== true) {
      return Response.json({ error: 'Please check your name, mobile number, city and consent.' }, { status: 400 });
    }
    await saveLead({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), name, phone, email, city, message, source: 'website' });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Could not save franchise enquiry:', error);
    return Response.json({ error: 'Your enquiry could not be saved. Please try again shortly.' }, { status: 503 });
  }
}
