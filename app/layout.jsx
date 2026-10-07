import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: "Lovely's Baker Street — Burgers, bites & good times",
  description: "Lovely's Baker Street serves burgers, bites and good times. Made fresh and ready to share.",
  openGraph: {
    title: "Lovely's Baker Street — Burgers, bites & good times",
    description: "Meet the Lovely's menu: burgers, loaded nachos and toasted wraps.",
    images: ['/DSC01024.jpg'],
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" /><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" /></head><body>{children}</body></html>;
}
