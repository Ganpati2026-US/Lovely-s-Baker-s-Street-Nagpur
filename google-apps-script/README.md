# Lovely’s Baker St. franchise Apps Script

This project records every website franchise enquiry in Google Sheets, sends the customer confirmation email, sends the owner notification receipt, and hosts the mobile-friendly box-opening page.

## Setup

1. Create a Google Sheet and copy its ID from its URL.
2. Open [script.new](https://script.new), create a new standalone project, and add the contents of `Code.gs` and `Index.html` as files with the same names.
3. In **Project settings → Script properties**, add:
   - `SPREADSHEET_ID` — your Sheet ID
   - `OWNER_EMAIL` — the email address that receives new franchise enquiries
   - `WEBHOOK_SECRET` — a long random value; use the exact same value in Cloudflare as `GOOGLE_APPS_SCRIPT_SECRET`
   - `BRAND_LOGO_URL` — optional public URL for the original Lovely’s logo, for example `https://YOUR-WORKER.workers.dev/lovely-logo.png`
4. Deploy → **New deployment** → **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Copy the `/exec` URL.
5. Add these Cloudflare Worker secrets/variables:
   - `GOOGLE_APPS_SCRIPT_WEB_APP_URL` — the Apps Script `/exec` URL
   - `GOOGLE_APPS_SCRIPT_SECRET` — the same `WEBHOOK_SECRET`
   - `NEXT_PUBLIC_SITE_URL` — the public website URL (optional, used elsewhere in the app)
6. Add the returned `/exec` URL as `PUBLIC_WEB_APP_URL` in Apps Script properties, then redeploy the Apps Script web app once.

## Notes

- Customer emails are sent only when an email is provided in the form.
- The essential confirmation text is in the email; the button opens the interactive box experience.
- The site keeps its normal lead storage. Apps Script delivery is an additional, non-blocking notification channel.
