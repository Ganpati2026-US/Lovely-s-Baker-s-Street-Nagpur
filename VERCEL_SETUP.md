# Lovely's Baker Street on Next.js + Vercel

## Run locally

Install dependencies and start the Next.js development server:

```sh
npm install
cp .env.example .env.local
# Set ADMIN_PASSWORD (and optionally ADMIN_SESSION_SECRET) inside .env.local.
npm run dev
```

Visit `http://localhost:3000/` and `http://localhost:3000/admin`.

Local enquiries are stored under `.server-data/`; local photo replacements go under `public/uploads/`. Those folders are ignored by Git.

## Deploy on Vercel

1. Push this repository to GitHub and import it into Vercel. Vercel detects Next.js and uses `npm run build`.
2. In the Vercel project, create and connect a **private Vercel Blob store**. Vercel supplies the Blob credentials to the deployment.
3. In Project Settings → Environment Variables, set `ADMIN_PASSWORD` to a long random password. Optionally set `ADMIN_SESSION_SECRET` to a different long random secret and `NEXT_PUBLIC_SITE_URL` to your production URL. Apply them to Production and Preview as appropriate, then redeploy.
4. Open `/admin`, sign in, and review enquiries or replace photos.

The functions store each enquiry and the photo manifest in private Blob storage. Updated photos also remain private in storage and are served to the public site through an application route. The user-requested email and WhatsApp notifications remain parked until provider accounts are available.

## Notes

- Vercel functions do not provide durable local file storage, so a connected Blob store is required for production leads and admin photo changes.
- Photo uploads are capped at 3 MB to fit within the Vercel function request limit.
- Existing food photography and the layered burger PNGs are in `public/` and continue to power the site and scroll animation.
- Keep `.server-data/`, `.env*`, and Vercel tokens out of Git. Never put the admin password or storage token in client-side code.
