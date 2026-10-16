'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
export default function SiteNav() {
 const path = usePathname();
 const [open, setOpen] = useState(false);
 const showBrandSheet = () => window.dispatchEvent(new Event('lovely-brand-sheet'));
 return <header className="site-header route-header"><button className="brand brand-button" type="button" aria-label="Open Lovely's Baker Street message" onClick={showBrandSheet}><img className="brand-logo" src="/lovely-logo.png" alt="Lovely's Baker Street" /></button>
 <button className="nav-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>{open ? 'Close ×' : 'Menu ☰'}</button>
 <nav id="site-navigation" className={'route-nav' + (open ? ' is-open' : '')} aria-label="Main navigation">{[['/', 'Home'], ['/food-gallery', 'Food Gallery'], ['/our-story', 'Our Story'], ['/menu', 'Menu']].map(([url, label]) => <a key={url} href={url} aria-current={path === url ? 'page' : undefined}>{label}</a>)}</nav>
 <a className="header-cta" href="/#franchise">Franchise with us ↗</a></header>;
}
