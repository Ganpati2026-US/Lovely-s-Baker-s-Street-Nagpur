import Script from 'next/script';

export const metadata = { title: "Admin — Lovely's Baker Street", robots: { index: false, follow: false } };

export default function AdminPage() {
  return <div className="admin-page">
    <header className="site-header"><a className="brand" href="/" aria-label="Lovely's Baker Street home"><img className="brand-logo" src="/lovely-logo.png" alt="Lovely's Baker Street logo" /></a><a className="text-link" href="/">← Back to website</a></header>
    <main className="admin-main">
      <section className="admin-login" id="admin-login"><p className="eyebrow">LOVELY'S BAKER STREET</p><h1>Site admin</h1><p>Sign in to review franchise enquiries and update website photos.</p><form id="login-form"><label htmlFor="admin-password">Admin password</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required /><button className="button button-red" type="submit">Sign in <span>↗</span></button><p className="admin-message" id="login-message" role="status" /></form></section>
      <div className="admin-dashboard" id="admin-dashboard" hidden>
        <div className="admin-title"><div><p className="eyebrow">MANAGE YOUR WEBSITE</p><h1>Lovely's admin</h1></div><button className="admin-logout" id="logout-button" type="button">Sign out</button></div>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">SITE IMAGES</p><h2>Update your photos</h2><p>Upload a JPG, PNG or WebP up to 3 MB. The selected image updates that section of the website.</p></div></div><div className="photo-manager" id="photo-manager" /></section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">PARTNER INTEREST</p><h2>Enquiries</h2><p>Submitted enquiries are saved here. Email and WhatsApp delivery can be connected later.</p></div><button className="admin-refresh" id="refresh-leads" type="button">Refresh</button></div><div className="lead-table-wrap"><table className="lead-table"><thead><tr><th>Received</th><th>Name</th><th>Phone</th><th>Email</th><th>City</th><th>Plans</th></tr></thead><tbody id="lead-rows" /></table></div><p className="admin-message" id="leads-message" role="status" /></section>
      </div>
    </main>
    <Script src="/admin.js" strategy="afterInteractive" />
  </div>;
}
