/**
 * Lovely's Baker St. franchise automation.
 *
 * Deploy this Apps Script project as a Web app: execute as Me, access Anyone.
 * Set the required Script Properties described in README.md before deployment.
 */
const BRAND = "LOVELY'S BAKER ST.";
const REQUIRED_PROPERTIES = ['SPREADSHEET_ID', 'OWNER_EMAIL', 'WEBHOOK_SECRET'];

function doGet(event) {
  const template = HtmlService.createTemplateFromFile('Index');
  template.customerName = clean_(event.parameter.name, 100) || 'Future Lovely’s Partner';
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
  const subject = '🍔 Your Franchise Journey Begins | Lovely’s Baker St.';
  const text = `Hi ${lead.name},\n\nThank you for your interest in becoming a part of the Lovely’s Baker St. family! We’ve successfully received your franchise enquiry. Mr. Mandeep will be in touch with you shortly regarding your franchise enquiry.\n\nGOOD THINGS TAKE TIME. GREAT THINGS START HERE.\n\nTeam Lovely’s Baker St.`;
  GmailApp.sendEmail(lead.email, subject, text, {
    name: BRAND,
    htmlBody: customerEmailHtml_(lead),
  });
}

function sendOwnerNotification_(lead) {
  const subject = '🚨 NEW FRANCHISE ENQUIRY | Lovely’s Baker St.';
  const text = `New franchise enquiry\n\nName: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email || 'Not provided'}\nCity: ${lead.city}\nPlans: ${lead.message || 'Not provided'}\nReference: ${lead.id}`;
  GmailApp.sendEmail(property_('OWNER_EMAIL'), subject, text, {
    name: BRAND,
    htmlBody: ownerEmailHtml_(lead),
  });
}

function customerEmailHtml_(lead) {
  const openUrl = webAppUrl_() + '?name=' + encodeURIComponent(lead.name) + '&ref=' + encodeURIComponent(lead.id);
  return emailFrame_(`
    <tr><td style="padding:30px 26px 18px;text-align:center;background:#ffffff;">
      ${logoHtml_()}
      <p style="margin:18px 0 5px;color:#d91624;font:700 11px Arial,sans-serif;letter-spacing:2px;">FRANCHISE ENQUIRY RECEIVED</p>
      <h1 style="margin:0;color:#221918;font:800 28px Arial,sans-serif;letter-spacing:-1px;">SOMETHING EXCITING<br>IS COOKING! 🍔</h1>
    </td></tr>
    <tr><td style="padding:2px 26px 24px;text-align:center;background:#ffffff;">
      ${redBoxHtml_()}
      <p style="margin:22px 0 0;color:#342826;font:16px/1.65 Arial,sans-serif;">Hi ${escapeHtml_(lead.name)},<br><br>Thank you for your interest in becoming a part of the Lovely’s Baker St. family! We’ve successfully received your franchise enquiry.<br><br><strong>Mr. Mandeep will be in touch with you shortly regarding your franchise enquiry.</strong><br><br>We’re excited to explore this opportunity with you!<br><br>Thank you! ❤️<br>Team Lovely’s Baker St.</p>
      <a href="${openUrl}" style="display:inline-block;margin:24px 0 17px;padding:15px 23px;background:#e51b27;color:#ffffff;border-radius:4px;font:800 12px Arial,sans-serif;letter-spacing:1px;text-decoration:none;">OPEN YOUR BOX 🍔</a>
      <p style="margin:0;color:#d91624;font:800 10px Arial,sans-serif;letter-spacing:1.4px;">GOOD THINGS TAKE TIME. GREAT THINGS START HERE.</p>
    </td></tr>`);
}

function ownerEmailHtml_(lead) {
  const row = (label, value) => `<tr><td style="padding:11px 0;border-bottom:1px dashed #e8c5bf;color:#a9101c;font:700 10px Arial,sans-serif;letter-spacing:1px;">${label}</td><td style="padding:11px 0 11px 15px;border-bottom:1px dashed #e8c5bf;color:#291c19;font:14px Arial,sans-serif;">${escapeHtml_(value || '—')}</td></tr>`;
  return emailFrame_(`
    <tr><td style="padding:28px 26px 22px;background:#e51b27;text-align:center;">${logoHtml_()}<p style="margin:13px 0 0;color:#fff;font:800 12px Arial,sans-serif;letter-spacing:2px;">NEW FRANCHISE ENQUIRY</p></td></tr>
    <tr><td style="padding:26px;background:#fffdf9;"><p style="margin:0 0 16px;color:#291c19;font:800 22px Arial,sans-serif;">Fresh from the enquiry counter 🍔</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${row('NAME', lead.name)}${row('MOBILE', lead.phone)}${row('EMAIL', lead.email)}${row('CITY', lead.city)}${row('PLANS', lead.message)}${row('REFERENCE', lead.id)}</table></td></tr>`);
}

function emailFrame_(content) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f2ed;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 10px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #f0d8d3;box-shadow:0 8px 24px rgba(72,25,20,.12);"><tr><td height="12" style="background:repeating-linear-gradient(90deg,#e51b27 0,#e51b27 18px,#fff8f0 18px,#fff8f0 36px);"></td></tr>${content}<tr><td height="12" style="background:repeating-linear-gradient(90deg,#e51b27 0,#e51b27 18px,#fff8f0 18px,#fff8f0 36px);"></td></tr></table></td></tr></table></body></html>`;
}

function redBoxHtml_() {
  return `<table role="presentation" width="230" align="center" cellspacing="0" cellpadding="0" style="margin:10px auto 0;"><tr><td style="padding:18px 12px;background:#f02a34;border:1px solid #b80f1b;border-radius:11px 11px 3px 3px;box-shadow:0 7px 0 #b80f1b,0 15px 18px rgba(70,17,15,.18);text-align:center;"><p style="margin:0;color:#fff;font:800 16px Arial,sans-serif;letter-spacing:1px;">LOVELY’S</p><p style="margin:4px 0 0;color:#fff8f0;font:700 9px Arial,sans-serif;letter-spacing:2px;">BAKER ST. · FRANCHISE BOX</p></td></tr></table>`;
}

function logoHtml_() {
  const url = property_('BRAND_LOGO_URL', false);
  return url ? `<img src="${escapeHtml_(url)}" width="86" alt="Lovely's Baker St." style="display:block;width:86px;height:auto;margin:0 auto;border:0;">` : `<p style="margin:0;color:#e51b27;font:800 15px Arial,sans-serif;letter-spacing:1px;">LOVELY’S BAKER ST.</p>`;
}

function webAppUrl_() { return property_('PUBLIC_WEB_APP_URL', false) || ScriptApp.getService().getUrl(); }
function property_(key, required = true) { const value = PropertiesService.getScriptProperties().getProperty(key); if (required && !value) throw new Error(`Missing Script Property: ${key}`); return value || ''; }
function assertConfigured_() { REQUIRED_PROPERTIES.forEach(key => property_(key)); }
function clean_(value, max) { return String(value || '').trim().replace(/[\u0000-\u001F]/g, '').slice(0, max); }
function escapeHtml_(value) { return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function safeEqual_(a, b) { if (a.length !== b.length) return false; let result = 0; for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i); return result === 0; }
function json_(payload) { return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON); }
