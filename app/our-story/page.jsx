import SiteNav from '../site-nav';
import SiteEffects from '../site-effects';
import PageMotion from '../page-motion';
export const metadata = { title: "Our Story | Lovely's Baker Street" };
export default function StoryPage() { return <><SiteNav /><main className="brand-page"><div className="brand-heading story-heading"><video className="story-heading-video" autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/our-story-background.mp4" type="video/mp4" /></video><div className="story-heading-content"><p>GOOD FOOD BRINGS US TOGETHER</p><h1>OUR <em>STORY.</em></h1><p>From the first burger to the last shared bite, Lovely's is a place to slow down, catch up and enjoy something delicious together.</p></div></div>
      <section className="story-section" id="story" aria-label="Lovely's journey from Nagpur to Hyderabad, Raipur and Bapatla">
        <div className="story-route" aria-label="Lovely's journey from Nagpur to Hyderabad, Raipur and Bapatla">
          <h2 className="journey-title">Our Story</h2>
          <svg className="route-map" viewBox="0 0 760 690" fill="none" role="img" aria-label="Nagpur, Hyderabad, Raipur, Bapatla" preserveAspectRatio="xMidYMid meet">
            <path className="route-line" data-route-leg d="M200 110 C205 210 310 145 310 230 S340 270 380 280" />
            <path className="route-line" data-route-leg d="M380 280 C310 335 410 355 340 400 S300 435 310 460" />
            <path className="route-line" data-route-leg d="M310 460 C315 565 410 495 420 575 S470 600 510 615" />
            <g className="journey-city is-active" data-story-stop="Nagpur" transform="translate(250 114)"><text>Nagpur</text></g>
            <g className="journey-city" data-story-stop="Hyderabad" transform="translate(430 284)"><text>Hyderabad</text></g>
            <g className="journey-city" data-story-stop="Raipur" transform="translate(255 465)"><text textAnchor="end">Raipur</text></g>
            <g className="journey-city" data-story-stop="Bapatla" transform="translate(558 622)"><text>Bapatla</text></g>
            <g className="story-burger" transform="translate(200 110)" aria-hidden="true">
              <image href="/story-travel-burger.png" x="-42" y="-57" width="84" height="84" preserveAspectRatio="xMidYMid meet" />
            </g>
          </svg>
        </div>
      </section>


<section className="brand-story-block"><img src="/DSC01175-1600.webp" alt="Lovely's burgers, wraps and nachos shared around the table" loading="lazy" /><div><p>MADE FRESH. ALWAYS LOVELY.</p><h2>PULL UP A CHAIR.<br />MAKE IT LOVELY.</h2><p>Big, satisfying bites made for sharing. Come by for the burger, stay for one more bite.</p><a className="button button-red" href="/menu">Find your favourite ↗</a></div></section></main>    
<SiteEffects /><PageMotion /></>; }
