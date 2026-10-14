export default function SiteFooter() {
  return <footer className="site-footer">
      <div className="footer-intro"><a className="brand footer-brand" href="/" aria-label="Lovely's Baker Street home"><img className="brand-logo" src="/lovely-logo.png" alt="Lovely's Baker Street logo" /></a><p>Lovely&apos;s Baker Street | Best Burger In India</p></div>
      <div className="footer-locations" aria-label="Our locations">
        <div><h2>NAGPUR HQ</h2><address>Shop no 4, Laxmi Niwas, near NIT Garden, Adarsh Colony, Bhamti, aptt, Trimurti Nagar, Nagpur, Maharashtra 440022</address></div>
        <div><h2>RAIPUR, CG</h2><address>C115, Sector 1, sec 1, Devendra Nagar, Raipur, Chhattisgarh 492009</address></div>
        <div><h2>BAPATLA, AP</h2><address>Lovely&apos;s, Baker Street, beside Banglore Bakery, opposite Mahila Lok, Maddiboinavaripalem, Bapatla, Andhra Pradesh 522101</address></div>
      </div>
      <div className="footer-bottom"><span>© 2026 LOVELY'S BAKER STREET</span><div className="footer-credit"><span>CRAFTED BY</span><a className="footer-wordmark" href="https://appetiserindia.com" target="_blank" rel="noopener noreferrer" aria-label="Appetiser India (opens in a new tab)"><span>Appetiser</span><span>INDIA</span></a><small>Think it. We will build it.</small></div><a className="admin-link" href="/admin">Admin</a></div>
    </footer>;
}
