/**
 * Lovely's Baker St. franchise automation.
 *
 * Deploy this Apps Script project as a Web app: execute as Me, access Anyone.
 * Set the required Script Properties described in README.md before deployment.
 */
const BRAND = "LOVELY'S BAKER ST.";
const OWNER_EMAIL = 'mandeep@lovelysbakerstreet.com';
const DEFAULT_LOGO_URL = 'https://lbswebsite.appetiserindia.workers.dev/lovely-logo.png';
const REQUIRED_PROPERTIES = ['SPREADSHEET_ID', 'WEBHOOK_SECRET'];

function doGet(event) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.customerName = clean_(event?.parameter?.name, 100) || 'Future Lovely’s Partner';
  return template.evaluate()
    .setTitle('Your Lovely’s Franchise Journey')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(event) {
  try {
    const data = JSON.parse(event.postData && event.postData.contents || '{}');
    assertConfigured_();
    if (!safeEqual_(String(data.secret || ''), property_('WEBHOOK_SECRET'))) throw new Error('Unauthorized request.');
    const lead = validateLead_(data);
    lead.id = Utilities.getUuid();
    lead.createdAt = new Date();
    appendLead_(lead);
    if (lead.email) sendCustomerConfirmation_(lead);
    sendOwnerNotification_(lead);
    return json_({ ok: true, id: lead.id });
  } catch (error) {
    console.error(error && error.stack || error);
    return json_({ ok: false, error: 'Unable to process enquiry.' });
  }
}

function validateLead_(data) {
  const lead = {
    name: clean_(data.name, 100),
    phone: clean_(data.phone, 24),
    email: clean_(data.email, 254),
    city: clean_(data.city, 100),
    message: clean_(data.message, 1000),
  };
  if (!lead.name || !lead.city || !/^[+\d().\-\s]{7,24}$/.test(lead.phone)) throw new Error('Invalid required fields.');
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) throw new Error('Invalid email.');
  return lead;
}

function appendLead_(lead) {
  const sheet = getSheet_();
  if (sheet.getLastRow() === 0) sheet.appendRow(['Received', 'Reference', 'Name', 'Phone', 'Email', 'City', 'Message', 'Source']);
  sheet.appendRow([lead.createdAt, lead.id, lead.name, lead.phone, lead.email, lead.city, lead.message, 'Website']);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(property_('SPREADSHEET_ID'));
  return spreadsheet.getSheetByName('Franchise Enquiries') || spreadsheet.insertSheet('Franchise Enquiries');
}

function sendCustomerConfirmation_(lead) {
  const subject = 'Your Franchise Journey Begins | Lovelys Baker St.';
  const text = `Hi ${lead.name},\n\nThank you for your interest in becoming a part of the Lovelys Baker St. family. We have successfully received your franchise enquiry. Mr. Mandeep will be in touch with you shortly regarding your franchise enquiry.\n\nGOOD THINGS TAKE TIME. GREAT THINGS START HERE.\n\nTeam Lovelys Baker St.`;
  GmailApp.sendEmail(lead.email, subject, text, {
    name: BRAND,
    htmlBody: customerEmailHtml_(lead),
  });
}

function sendOwnerNotification_(lead) {
  const subject = 'NEW FRANCHISE ENQUIRY | Lovelys Baker St.';
  const text = `New franchise enquiry\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'Not provided'}\nCity: ${lead.city}\nPlans: ${lead.message || 'Not provided'}\nReference: ${lead.id}`;
  GmailApp.sendEmail(OWNER_EMAIL, subject, text, {
    name: BRAND,
    htmlBody: ownerEmailHtml_(lead),
  });
}

function customerEmailHtml_(lead) {
  const openUrl = webAppUrl_() + '?name=' + encodeURIComponent(lead.name) + '&ref=' + encodeURIComponent(lead.id);
  return emailFrame_(`
    <tr><td align="center" style="padding:28px 28px 10px;background:#fffdf9;">${logoHtml_(96)}<p style="margin:17px 0 7px;color:#e51b27;font:700 10px Arial,sans-serif;letter-spacing:2px;">FRANCHISE ENQUIRY RECEIVED</p><h1 style="margin:0;color:#251b19;font:800 28px/1.06 Arial,sans-serif;letter-spacing:-.8px;">SOMETHING EXCITING<br>IS COOKING</h1></td></tr>
    <tr><td align="center" style="padding:18px 28px 4px;background:#fffdf9;">${redBoxHtml_()}</td></tr>
    <tr><td align="center" style="padding:22px 36px 12px;background:#fffdf9;"><p style="margin:0;color:#332724;font:16px/1.65 Arial,sans-serif;">Hi ${escapeHtml_(lead.name)},</p><p style="margin:20px 0 0;color:#332724;font:15px/1.7 Arial,sans-serif;">Thank you for your interest in becoming a part of the Lovelys Baker St. family. We have successfully received your franchise enquiry.</p><p style="margin:19px 0 0;color:#251b19;font:700 15px/1.65 Arial,sans-serif;">Mr. Mandeep will be in touch with you shortly regarding your franchise enquiry.</p><p style="margin:19px 0 0;color:#332724;font:15px/1.7 Arial,sans-serif;">We are excited to explore this opportunity with you.</p><p style="margin:20px 0 0;color:#332724;font:15px/1.55 Arial,sans-serif;">Thank you,<br>Team Lovelys Baker St.</p></td></tr>
    <tr><td align="center" style="padding:10px 28px 27px;background:#fffdf9;"><a href="${openUrl}" style="display:inline-block;padding:15px 28px;background:#e51b27;border:1px solid #bb111d;border-radius:4px;color:#fff;font:700 12px Arial,sans-serif;letter-spacing:1px;text-decoration:none;">OPEN YOUR BOX</a><p style="margin:23px 0 0;color:#e51b27;font:700 9px Arial,sans-serif;letter-spacing:1.5px;">GOOD THINGS TAKE TIME. GREAT THINGS START HERE.</p></td></tr>`);
}

function ownerEmailHtml_(lead) {
  const row = (label, value) => `<tr><td width="31%" style="padding:13px 0;border-bottom:1px dashed #ecc8c1;color:#d51624;font:700 10px Arial,sans-serif;letter-spacing:1.2px;vertical-align:top;">${label}</td><td style="padding:13px 0 13px 14px;border-bottom:1px dashed #ecc8c1;color:#2c211f;font:14px/1.45 Arial,sans-serif;">${escapeHtml_(value || 'Not provided')}</td></tr>`;
  return emailFrame_(`
    <tr><td align="center" style="padding:25px 26px 20px;background:#e51b27;">${logoHtml_(78)}<p style="margin:13px 0 0;color:#fff;font:700 10px Arial,sans-serif;letter-spacing:2px;">NEW FRANCHISE ENQUIRY</p></td></tr>
    <tr><td style="padding:27px 28px 32px;background:#fffdf9;"><p style="margin:0 0 5px;color:#e51b27;font:700 10px Arial,sans-serif;letter-spacing:1.5px;">LOVELYS BAKER ST.</p><h1 style="margin:0 0 20px;color:#251b19;font:800 25px Arial,sans-serif;letter-spacing:-.5px;">Fresh from the enquiry counter</h1><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row('NAME', lead.name)}${row('MOBILE', lead.phone)}${row('EMAIL', lead.email)}${row('CITY', lead.city)}${row('PLANS', lead.message)}${row('REFERENCE', lead.id)}</table><p style="margin:22px 0 0;color:#806e69;font:11px Arial,sans-serif;">Submitted from the Lovelys Baker St. website.</p></td></tr>`);
}

function emailFrame_(content) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f3efea;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3efea;"><tr><td align="center" style="padding:26px 10px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fffdf9;border:1px solid #efd7d1;">${checkerStrip_()}${content}${checkerStrip_()}</table></td></tr></table></body></html>`;
}

function checkerStrip_() { let cells = ''; for (let i = 0; i < 20; i++) cells += `<td width="5%" height="12" style="background:${i % 2 ? '#fff8f0' : '#e51b27'};font-size:0;line-height:0;">&nbsp;</td>`; return `<tr>${cells}</tr>`; }

function redBoxHtml_() {
  return `<table role="presentation" width="248" align="center" cellspacing="0" cellpadding="0" style="margin:0 auto;"><tr><td align="center" style="padding:15px 14px 13px;background:#ed2934;border:1px solid #bd111c;border-radius:9px 9px 3px 3px;box-shadow:0 8px 0 #bd111c;"><img src="${brandLogoUrl_()}" width="46" alt="Lovelys Baker St." style="display:block;width:46px;height:46px;object-fit:contain;margin:0 auto 5px;border:0;"><p style="margin:0;color:#fff;font:700 13px Arial,sans-serif;letter-spacing:1.1px;">LOVELYS</p><p style="margin:4px 0 0;color:#fff8f0;font:700 8px Arial,sans-serif;letter-spacing:1.8px;">BAKER ST. FRANCHISE BOX</p></td></tr></table>`;
}

function logoHtml_(width) {
  return `<img src="${brandLogoUrl_()}" width="${width}" alt="Lovelys Baker St." style="display:block;width:${width}px;height:auto;margin:0 auto;border:0;">`;
}

function brandLogoUrl_() { return property_('BRAND_LOGO_URL', false) || DEFAULT_LOGO_URL; }
function webAppUrl_() { return property_('PUBLIC_WEB_APP_URL', false) || ScriptApp.getService().getUrl(); }
function property_(key, required = true) { const value = PropertiesService.getScriptProperties().getProperty(key); if (required && !value) throw new Error(`Missing Script Property: ${key}`); return value || ''; }
function assertConfigured_() { REQUIRED_PROPERTIES.forEach(key => property_(key)); }
function clean_(value, max) { return String(value || '').trim().replace(/[\u0000-\u001F]/g, '').slice(0, max); }
function escapeHtml_(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function safeEqual_(a, b) { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
