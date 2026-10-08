import SiteEffects from './site-effects';
import LaunchView from './launch/LaunchView';

export default function HomePage() {
  return <>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Lovely's Baker Street home"><img className="brand-logo" src="/lovely-logo.png" alt="Lovely's Baker Street logo" /></a>
      <nav className="nav-links" aria-label="Main navigation"><a href="#menu">Menu</a><a href="#burger-story">The stack</a><a href="#story">Our story</a></nav>
      <a className="header-cta" href="#franchise">Franchise with us <span aria-hidden="true">↗</span></a>
    </header>
    <main id="top">
      <LaunchView />
      <section className="hero" id="home" aria-labelledby="hero-title">
        <div className="hero-copy"><p className="eyebrow"><i /> LOVELY'S BAKER STREET · EST. 2015</p><h1 id="hero-title">BURGERS.<br /><em>BITES.</em><br />GOOD TIMES.</h1><p className="hero-description">Big, satisfying bites made for sharing. Come by for the burger, stay for one more bite.</p><div className="hero-actions"><a className="button button-red" href="#franchise">Become a partner <span>↓</span></a><a className="text-link" href="#menu">Explore the menu <span>↗</span></a></div><p className="hero-note">MADE FRESH. ALWAYS LOVELY.</p></div>
        <div className="hero-visual" id="burger-stage"><div className="hero-backdrop" aria-hidden="true" /><span className="hero-orbit hero-orbit-one" aria-hidden="true" /><span className="hero-orbit hero-orbit-two" aria-hidden="true" /><div className="hero-photo-wrap"><img className="hero-photo" data-photo="hero" src="/DSC01024.jpg" alt="Lovely's signature burger served in its red-and-cream branded tray" fetchPriority="high" /></div><span className="hero-caption">THE LOVELY'S BURGER · MADE TO BE ENJOYED</span></div>
      </section>

      <section className="menu-section section-pad" id="menu" aria-labelledby="menu-title">
        <div className="section-top"><div><p className="eyebrow">FRESH FROM OUR KITCHEN</p><h2 id="menu-title">A FEW <em>FAVOURITES.</em></h2></div><p>Good food, lovely company.<br />Find something for the table.</p></div>
        <div className="menu-grid">
          <article className="menu-card menu-featured"><div className="menu-image"><img data-photo="menu-burger" src="/DSC01024.jpg" alt="A Lovely's burger with a sesame bun and fresh lettuce" loading="lazy" /><span className="menu-index">01</span></div><div className="menu-info"><div><h3>The Lovely's Burger</h3><p>Our signature, stacked and served fresh.</p></div></div></article>
          <article className="menu-card"><div className="menu-image"><img data-photo="menu-nachos" src="/DSC01130.jpg" alt="Loaded nachos with cheese and sauce" loading="lazy" /><span className="menu-index">02</span></div><div className="menu-info"><div><h3>Loaded Nachos</h3><p>Crunchy, cheesy, and made for sharing.</p></div></div></article>
          <article className="menu-card"><div className="menu-image"><img data-photo="menu-wrap" src="/DSC01064.jpg" alt="Toasted wrap served with Lovely's signature sauce" loading="lazy" /><span className="menu-index">03</span></div><div className="menu-info"><div><h3>Toasted Wrap</h3><p>A warm, satisfying bite with a little crunch.</p></div></div></article>
        </div><p className="menu-footnote">A TASTE OF WHAT WE DO. ASK US WHAT'S FRESH TODAY.</p>
      </section>

      <section className="story-section" id="story" aria-labelledby="story-title"><div className="story-image"><img data-photo="story" src="/DSC01175.jpg" alt="A table full of Lovely's burgers, wraps, nachos and sauces" loading="lazy" /></div><div className="story-copy"><p className="eyebrow">GOOD FOOD BRINGS US TOGETHER</p><h2 id="story-title">PULL UP A CHAIR.<br /><em>MAKE IT LOVELY.</em></h2><p>From the first burger to the last shared bite, Lovely's is a place to slow down, catch up and enjoy something delicious together.</p><a className="button button-cream" href="#menu">Find your favourite <span>↗</span></a></div></section>

      <section className="franchise-section section-pad" id="franchise" aria-labelledby="franchise-title">
        <div className="franchise-intro"><p className="eyebrow">GROW WITH LOVELY'S</p><h2 id="franchise-title">LET'S MAKE<br /><em>IT A LOVELY BUSINESS.</em></h2><p>Interested in bringing Lovely's Baker Street to your city? Share a few details and our franchise team will get in touch.</p></div>
        <form className="franchise-form" id="franchise-form">
          <div className="form-grid"><label>Your name<input name="name" autoComplete="name" maxLength="100" required /></label><label>Mobile number<input name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength="20" required /></label><label>Email address <span>(optional)</span><input name="email" type="email" autoComplete="email" maxLength="254" /></label><label>City you'd like to open in<input name="city" autoComplete="address-level2" maxLength="100" required /></label></div>
          <label className="message-label">A little about your plans <span>(optional)</span><textarea name="message" rows="3" maxLength="1000" /></label><label className="consent-label"><input name="consent" type="checkbox" required /><span>I agree that Lovely's Baker Street may contact me about franchise opportunities.</span></label><div className="form-trap" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex="-1" autoComplete="off" /></label></div><button className="button button-red" type="submit">Send my enquiry <span>↗</span></button><p className="form-note">We’ll use your details only to follow up about franchise opportunities.</p><p className="form-status" id="form-status" role="status" aria-live="polite" />
        </form>
      </section>

      <section className="burger-story" id="burger-story" aria-labelledby="burger-story-title">
        <div className="burger-story-heading"><p className="eyebrow">A CLOSER LOOK AT THE LOVELY STACK</p><h2 id="burger-story-title">BUILT TOGETHER.<br /><em>PULLED APART.</em></h2><p>Scroll to bring the burger together, then take it apart layer by layer. Each chapter has a video slot ready for your kitchen footage.</p></div>
        <div className="burger-story-layout"><div className="burger-stack-stage" aria-label="Interactive burger stack that assembles and separates as you scroll"><div className="stack-backdrop" aria-hidden="true" /><span className="stack-orbit stack-orbit-one" aria-hidden="true" /><span className="stack-orbit stack-orbit-two" aria-hidden="true" /><img className="stack-fallback" data-photo="hero" src="/DSC01024.jpg" alt="Lovely's signature burger" loading="lazy" /><canvas id="burger-canvas" role="img" aria-label="Burger layers assemble and separate as you scroll" /><div className="stack-caption"><span>THE LOVELY'S STACK</span><span>SCROLL TO EXPLORE ↓</span></div></div>
          <div className="burger-chapters">
            <article className="burger-chapter" data-chapter="build"><div className="video-slot" aria-label="Video placeholder for burger assembly"><span className="video-label">VIDEO PLACEHOLDER · THE BUILD</span><span className="play-mark" aria-hidden="true">▶</span></div><div className="chapter-copy"><span className="chapter-number">01 — STACK IT UP</span><h3>First, bring it all together.</h3><p>Scroll to assemble the bun, greens, tomato, onion and patties into one Lovely's burger.</p></div></article>
            <article className="burger-chapter" data-chapter="crown"><div className="video-slot" aria-label="Video placeholder for the toasted bun"><span className="video-label">VIDEO PLACEHOLDER · THE CROWN</span><span className="play-mark" aria-hidden="true">▶</span></div><div className="chapter-copy"><span className="chapter-number">02 — THE CROWN</span><h3>Golden, toasted, ready.</h3><p>A soft sesame bun gets the first spot in the stack.</p></div></article>
            <article className="burger-chapter" data-chapter="fresh"><div className="video-slot" aria-label="Video placeholder for fresh burger toppings"><span className="video-label">VIDEO PLACEHOLDER · THE FRESH LAYERS</span><span className="play-mark" aria-hidden="true">▶</span></div><div className="chapter-copy"><span className="chapter-number">03 — THE FRESH LAYERS</span><h3>A little crunch in every bite.</h3><p>Fresh lettuce, ripe tomato and onion bring the stack to life.</p></div></article>
            <article className="burger-chapter" data-chapter="patty"><div className="video-slot" aria-label="Video placeholder for burger patties"><span className="video-label">VIDEO PLACEHOLDER · THE PATTY</span><span className="play-mark" aria-hidden="true">▶</span></div><div className="chapter-copy"><span className="chapter-number">04 — THE PATTY</span><h3>That crispy-edge moment.</h3><p>Two cheesy patties bring the rich, savoury middle.</p></div></article>
            <article className="burger-chapter" data-chapter="finish"><div className="video-slot" aria-label="Video placeholder for the finished burger"><span className="video-label">VIDEO PLACEHOLDER · THE FINISH</span><span className="play-mark" aria-hidden="true">▶</span></div><div className="chapter-copy"><span className="chapter-number">05 — PULL IT APART</span><h3>All the good stuff, on show.</h3><p>Keep scrolling to see every layer lift away from the finished Lovely's stack.</p></div></article>
          </div>
        </div>
      </section>
    </main>
    <footer className="site-footer">
      <div className="footer-intro"><a className="brand footer-brand" href="#top" aria-label="Lovely's Baker Street home"><img className="brand-logo" src="/lovely-logo.png" alt="Lovely's Baker Street logo" /></a><p>BURGERS, BITES &amp; GOOD TIMES.</p></div>
      <div className="footer-locations" aria-label="Our locations">
        <div><h2>NAGPUR HQ</h2><address>Shop no 4, Laxmi Niwas, near NIT Garden, Adarsh Colony, Bhamti, aptt, Trimurti Nagar, Nagpur, Maharashtra 440022</address></div>
        <div><h2>RAIPUR, CG</h2><address>C115, Sector 1, sec 1, Devendra Nagar, Raipur, Chhattisgarh 492009</address></div>
        <div><h2>BAPATLA, AP</h2><address>Lovely&apos;s, Baker Street, beside Banglore Bakery, opposite Mahila Lok, Maddiboinavaripalem, Bapatla, Andhra Pradesh 522101</address></div>
      </div>
      <div className="footer-bottom"><span>© 2026 LOVELY'S BAKER STREET</span><div className="footer-credit"><span>CRAFTED BY</span><a className="footer-logo-link" href="https://appetiserindia.com" target="_blank" rel="noopener noreferrer" aria-label="Appetiser India (opens in a new tab)"><img src="/appetiser-india-logo.jpeg" alt="Appetiser India" loading="lazy" /></a><small>Think it. We will build it.</small></div><a className="admin-link" href="/admin">Admin</a></div>
    </footer>
    <SiteEffects />
  </>;
}
