const BRAND = "LOVELY'S BAKER ST.";
const OWNER_EMAIL = 'mandeep@lovelysbakerstreet.com';
const LOGO_URL = 'https://lbswebsite.appetiserindia.workers.dev/lovely-logo.png';
const PAPER_URL = 'https://lbswebsite.appetiserindia.workers.dev/lbs-paper.png';
const REQUIRED_PROPERTIES = ['SPREADSHEET_ID', 'WEBHOOK_SECRET'];

function doGet(event) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.customerName = clean_(event && event.parameter && event.parameter.name, 100) || 'Future Lovely Partner';
  return template.evaluate().setTitle('Lovelys Baker St.');
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
    return json_({ ok: true });
  } catch (error) {
    console.error(error && error.stack || error);
    return json_({ ok: false, error: 'Unable to process enquiry.' });
  }
}

function validateLead_(data) {
  const lead = { name: clean_(data.name, 100), phone: clean_(data.phone, 24), email: clean_(data.email, 254), city: clean_(data.city, 100), message: clean_(data.message, 1000) };
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
  const book = SpreadsheetApp.openById(property_('SPREADSHEET_ID'));
  return book.getSheetByName('Franchise Enquiries') || book.insertSheet('Franchise Enquiries');
}

function sendCustomerConfirmation_(lead) {
  const subject = 'Your Franchise Journey Begins | Lovelys Baker St.';
  const plain = `Hi ${lead.name},\n\nThank you for your interest in becoming part of the Lovelys Baker St. family. Your franchise enquiry has been successfully received. Mr. Mandeep will be in touch with you shortly.\n\nTeam Lovelys Baker St.`;
  GmailApp.sendEmail(lead.email, subject, plain, { name: BRAND, htmlBody: customerEmailHtml_(lead) });
}

function sendOwnerNotification_(lead) {
  const subject = 'NEW FRANCHISE ENQUIRY | Lovelys Baker St.';
  const plain = `New franchise enquiry\n\nName: ${lead.name}\nMobile: ${lead.phone}\nEmail: ${lead.email || 'Not provided'}\nCity: ${lead.city}\nPlans: ${lead.message || 'Not provided'}`;
  GmailApp.sendEmail(OWNER_EMAIL, subject, plain, { name: BRAND, htmlBody: ownerEmailHtml_(lead) });
}

function customerEmailHtml_(lead) {
  const openUrl = webAppUrl_() + '?name=' + encodeURIComponent(lead.name);
  return emailShell_(`
    <tr><td align="center" style="padding:34px 32px 12px;background:#ffffff;">${logo_(92)}<h1 style="margin:22px 0 0;color:#252525;font:800 29px/1.07 Arial,sans-serif;letter-spacing:-1px;">SOMETHING EXCITING<br>IS COOKING! &#127828;</h1></td></tr>
    <tr><td align="center" style="padding:22px 38px 0;background:#ffffff;"><p style="margin:0;color:#252525;font:16px/1.65 Arial,sans-serif;">Hi ${escapeHtml_(lead.name)},</p><p style="margin:19px 0 0;color:#252525;font:15px/1.7 Arial,sans-serif;">Thank you for your interest in becoming part of the Lovelys Baker St. family.<br>Your franchise enquiry has been successfully received.</p></td></tr>
    <tr><td style="padding:22px 32px 8px;background:#ffffff;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff0ee;border:1px solid #ffd3d5;border-radius:16px;"><tr><td align="center" style="padding:19px 22px;color:#9d1017;font:700 15px/1.55 Arial,sans-serif;">Mr. Mandeep will be in touch with you shortly regarding your franchise enquiry.</td></tr></table></td></tr>
    <tr><td align="center" style="padding:16px 38px 30px;background:#ffffff;"><p style="margin:0;color:#252525;font:15px/1.65 Arial,sans-serif;">Thank you for choosing Lovelys Baker St.<br>Warm regards,<br>Team Lovelys Baker St.</p><a href="${openUrl}" style="display:inline-block;margin-top:25px;padding:15px 29px;background:#ed1c24;border-radius:999px;color:#ffffff;font:800 12px Arial,sans-serif;letter-spacing:1px;text-decoration:none;">OPEN YOUR BOX &rarr;</a><p style="margin:25px 0 0;color:#ed1c24;font:800 9px/1.6 Arial,sans-serif;letter-spacing:1.5px;">GOOD THINGS TAKE TIME.<br>GREAT THINGS START HERE.</p></td></tr>`);
}

function ownerEmailHtml_(lead) {
  const item = (label, value) => `<tr><td style="padding:13px 0;border-bottom:1px solid #f3d9d8;color:#ed1c24;font:800 10px Arial,sans-serif;letter-spacing:1px;vertical-align:top;">${label}</td><td align="right" style="padding:13px 0 13px 16px;border-bottom:1px solid #f3d9d8;color:#252525;font:14px/1.45 Arial,sans-serif;word-break:break-word;">${escapeHtml_(value || 'Not provided')}</td></tr>`;
  const call = 'tel:' + encodeURIComponent(lead.phone);
  const reply = lead.email ? 'mailto:' + encodeURIComponent(lead.email) : '';
  return emailShell_(`
    <tr><td align="center" style="padding:30px 28px 24px;background:#ffffff;">${logo_(86)}<p style="margin:18px 0 0;color:#ed1c24;font:800 10px Arial,sans-serif;letter-spacing:2px;">NEW FRANCHISE ENQUIRY &#127828;</p><h1 style="margin:9px 0 0;color:#252525;font:800 27px Arial,sans-serif;letter-spacing:-.7px;">A fresh opportunity<br>is on the counter.</h1></td></tr>
    <tr><td style="padding:0 28px 14px;background:#ffffff;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;border:1px solid #f0dcdc;border-radius:18px;box-shadow:0 7px 19px rgba(75,25,22,.08);"><tr><td style="padding:8px 20px 13px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${item('CUSTOMER', lead.name)}${item('MOBILE', lead.phone)}${item('EMAIL', lead.email)}${item('CITY', lead.city)}${item('FRANCHISE PLANS', lead.message)}</table></td></tr></table></td></tr>
    <tr><td align="center" style="padding:12px 28px 32px;background:#ffffff;"><a href="${call}" style="display:inline-block;margin:5px;padding:13px 17px;background:#ed1c24;border-radius:999px;color:#ffffff;font:800 10px Arial,sans-serif;letter-spacing:.7px;text-decoration:none;">CALL APPLICANT</a>${reply ? `<a href="${reply}" style="display:inline-block;margin:5px;padding:13px 17px;background:#ffffff;border:1px solid #ed1c24;border-radius:999px;color:#ed1c24;font:800 10px Arial,sans-serif;letter-spacing:.7px;text-decoration:none;">REPLY VIA EMAIL</a>` : ''}</td></tr>`);
}

function emailShell_(content) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#fff8f3;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff8f3;"><tr><td align="center" style="padding:24px 10px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #f4d6d6;">${checker_()}${content}${checker_()}</table></td></tr></table></body></html>`;
}

function checker_() { return '<tr><td height="12" style="background:repeating-linear-gradient(90deg,#ed1c24 0,#ed1c24 18px,#fff8f3 18px,#fff8f3 36px);font-size:0;line-height:0;">&nbsp;</td></tr>'; }
function logo_(width) { return `<img src="${LOGO_URL}" width="${width}" alt="Lovelys Baker St." style="display:block;width:${width}px;height:auto;margin:0 auto;border:0;border-radius:50%;">`; }
function webAppUrl_() { return property_('PUBLIC_WEB_APP_URL', false) || ScriptApp.getService().getUrl(); }
function property_(key, required) { const value = PropertiesService.getScriptProperties().getProperty(key); if (required !== false && !value) throw new Error(`Missing Script Property: ${key}`); return value || ''; }
function assertConfigured_() { REQUIRED_PROPERTIES.forEach(key => property_(key)); }
function clean_(value, max) { return String(value || '').trim().replace(/[\u0000-\u001F]/g, '').slice(0, max); }
function escapeHtml_(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function safeEqual_(a, b) { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
