'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const CITIES = ['NAGPUR', 'RAIPUR', 'HYDERABAD', 'BAPATLA', 'INDIA'];

export default function HomeLoader() {
  const [visible, setVisible] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const finish = useCallback(() => {
    if (leaving) return;
    window.sessionStorage.setItem('lovely-home-intro-seen', 'true');
    setLeaving(true);
  }, [leaving]);

  useLayoutEffect(() => {
    setVisible(!window.sessionStorage.getItem('lovely-home-intro-seen'));
  }, []);

  useEffect(() => {
    if (!visible || leaving) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, 11500);
    return () => window.clearTimeout(timer);
  }, [finish, leaving, visible]);

  useEffect(() => {
    if (!leaving) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.dispatchEvent(new Event('lovely-home-intro-complete'));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [leaving]);

  useEffect(() => {
    if (!visible || leaving) return;
    const timer = window.setInterval(() => setCityIndex(current => Math.min(current + 1, CITIES.length - 1)), 2000);
    return () => window.clearInterval(timer);
  }, [leaving, visible]);

  if (visible !== true) return null;

  return <section className={'home-loader' + (leaving ? ' is-leaving' : '')} aria-label="Lovely's Baker Street introduction">
    <video className="home-loader-video" autoPlay muted loop playsInline preload="auto" aria-hidden="true">
      <source src="/home-loader.mp4" type="video/mp4" />
    </video>
    <div className="home-loader-shade" aria-hidden="true" />
    <div className="home-loader-content">
      <span className="home-loader-kicker">LOVELY&apos;S BAKER STREET</span>
      <h1>BEST BURGER<br /><span className="home-loader-of">OF</span><br /><em className="home-loader-city" key={cityIndex}>{CITIES[cityIndex]}</em></h1>
    </div>
  </section>;
}
