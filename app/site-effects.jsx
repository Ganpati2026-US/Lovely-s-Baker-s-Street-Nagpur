'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let revealObserver;
    let revealTargets = [];

    if (!motionPreference.matches && 'IntersectionObserver' in window) {
      const groups = [
        ['.hero-copy > *', 'rise', 75],
        ['.hero-visual', 'plate', 0],
        ['.section-top > *', 'rise', 100],
        ['.menu-card', 'serve', 130],
        ['.menu-footnote', 'rise', 0],
        ['.story-image', 'plate', 0],
        ['.story-copy > *', 'rise', 90],
        ['.franchise-intro > *', 'rise', 90],
        ['.franchise-form .form-grid label, .franchise-form .message-label, .franchise-form .consent-label, .franchise-form > .button, .franchise-form .form-note', 'rise', 55],
        ['.burger-story-heading > *', 'rise', 90],
        ['.burger-stack-stage', 'fade', 0],
        ['.burger-chapter .video-slot', 'serve', 0],
        ['.burger-chapter .chapter-copy', 'rise', 100],
      ];

      groups.forEach(([selector, type, step]) => {
        document.querySelectorAll(selector).forEach((element, index) => {
          element.dataset.reveal = type;
          element.style.setProperty('--reveal-delay', `${Math.min(index * step, 350)}ms`);
          revealTargets.push(element);
        });
      });

      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

      revealTargets.forEach(element => revealObserver.observe(element));
      document.documentElement.classList.add('motion-ready');
    }

    let disposed = false;
    const effectsScript = document.createElement('script');
    const mainScript = document.createElement('script');
    effectsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    effectsScript.onload = () => {
      if (disposed) return;
      mainScript.src = '/main.js';
      document.body.appendChild(mainScript);
    };
    effectsScript.onerror = () => console.error('Could not load Three.js for the burger animation.');
    document.head.appendChild(effectsScript);
    return () => {
      disposed = true;
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-ready');
      revealTargets.forEach(element => {
        element.classList.remove('is-revealed');
        delete element.dataset.reveal;
        element.style.removeProperty('--reveal-delay');
      });
      effectsScript.remove();
      mainScript.remove();
    };
  }, []);

  return null;
}
