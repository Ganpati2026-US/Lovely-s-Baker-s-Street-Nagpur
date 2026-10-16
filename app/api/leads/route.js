import crypto from 'node:crypto';
import { saveLead } from '@/lib/storage';

export const runtime = 'nodejs';

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, max) : '';
}

async function notifyAppsScript(lead) {
  const url = process.env.GOOGLE_APPS_SCRIPT_WEB_APP_URL;
  const secret = process.env.GOOGLE_APPS_SCRIPT_SECRET;
  if (!url || !secret) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...lead, secret }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Apps Script returned ${response.status}`);
  } catch (error) {
    // The website submission remains successful because its primary lead record was saved.
    console.error('Could not notify franchise Apps Script:', error);
  } finally {
    clearTimeout(timeout);
  }
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
    const lead = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), name, phone, email, city, message, source: 'website' };
    await saveLead(lead);
    await notifyAppsScript(lead);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Could not save franchise enquiry:', error);
    return Response.json({ error: 'Your enquiry could not be saved. Please try again shortly.' }, { status: 503 });
  }
}
