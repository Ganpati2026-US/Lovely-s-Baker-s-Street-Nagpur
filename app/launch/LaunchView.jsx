'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import LaunchBurger from './LaunchBurger';

export default function LaunchView() {
  const section = useRef(null);
  const rotation = useRef({ yaw: -.18, pitch: 0 });
  const drag = useRef(null);
  const [rotationVersion, setRotationVersion] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const endDrag = event => {
    if (drag.current?.id !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.classList.remove('is-dragging');
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  useEffect(() => {
    setMounted(true);
    setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: '150px' });
    if (section.current) observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  return <section ref={section} className="launch-view" aria-labelledby="launch-title">
    <div className="launch-inner">
      <div className="launch-copy">
        <span className="launch-kicker"><span className="launch-kicker-dot" /> LOVELY'S BAKER STREET</span>
        <h1 id="launch-title">THE NEXT<br /><em>BIG BITE.</em></h1>
        <p className="launch-lede">Big flavour. Made with love.</p>
        <div className="launch-actions"><a className="launch-primary" href="#menu">Explore the menu <span aria-hidden="true">↗</span></a></div>
      </div>
      <div className="launch-visual">
        <img className="launch-logo-backdrop" src="/lovely-logo.png" alt="" aria-hidden="true" />
        <img className={`launch-fallback${ready ? ' is-hidden' : ''}`} src="/DSC01024.jpg" srcSet="/DSC01024-960.webp 960w, /DSC01024-1600.webp 1600w, /DSC01024.jpg 2200w" sizes="(max-width: 700px) 90vw, 50vw" decoding="async" fetchPriority="high" alt="" aria-hidden="true" />
        {mounted && <div className="launch-canvas" role="group" aria-label="3D burger. Drag to rotate it, or use the arrow keys." tabIndex={0}
          onPointerDown={event => {
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.classList.add('is-dragging');
            event.currentTarget.focus();
          }}
          onPointerMove={event => {
            if (drag.current?.id !== event.pointerId) return;
            const width = Math.max(280, Math.min(window.innerWidth, 600));
            rotation.current.yaw += (event.clientX - drag.current.x) / width * Math.PI * 2;
            rotation.current.pitch = Math.max(-.35, Math.min(.35, rotation.current.pitch + (event.clientY - drag.current.y) / width * Math.PI));
            drag.current.x = event.clientX;
            drag.current.y = event.clientY;
            if (reducedMotion) setRotationVersion(value => value + 1);
          }}
          onPointerUp={endDrag} onPointerCancel={endDrag}
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
            event.preventDefault();
            if (event.key === 'ArrowLeft') rotation.current.yaw -= Math.PI / 12;
            if (event.key === 'ArrowRight') rotation.current.yaw += Math.PI / 12;
            if (event.key === 'ArrowUp') rotation.current.pitch = Math.max(-.35, rotation.current.pitch - .08);
            if (event.key === 'ArrowDown') rotation.current.pitch = Math.min(.35, rotation.current.pitch + .08);
            if (reducedMotion) setRotationVersion(value => value + 1);
          }}><LaunchBurger active={active} onReady={onReady} reducedMotion={reducedMotion} rotation={rotation} rotationVersion={rotationVersion} /></div>}
        <span className="launch-visual-label">DRAG TO ROTATE THE BURGER ↔</span>
      </div>
    </div>
    <a className="launch-scroll" href="#home">SCROLL TO DISCOVER <span aria-hidden="true">↓</span></a>
  </section>;
}
