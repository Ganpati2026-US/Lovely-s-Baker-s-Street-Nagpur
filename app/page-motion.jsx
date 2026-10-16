'use client';
import { useEffect } from 'react';
export default function PageMotion() {
 useEffect(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = [...document.querySelectorAll('.gallery-card, .menu-category, .brand-story-block')];
  const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) { entry.target.classList.add('in-view'); reveal.unobserve(entry.target); }
  }), { threshold: .05 });
  if (!reduced.matches) targets.forEach(el => { el.classList.add('reveal-ready'); reveal.observe(el); });
  const links = [...document.querySelectorAll('.category-nav a')];
  const active = new IntersectionObserver(entries => entries.forEach(entry => {
   if (entry.isIntersecting) links.forEach(link => {
    if (link.hash === '#'+entry.target.id) link.setAttribute('aria-current','location');
    else link.removeAttribute('aria-current');
   });
  }), { rootMargin: '-15% 0px -60% 0px' });
  document.querySelectorAll('.menu-category').forEach(el=>active.observe(el));
  return () => { reveal.disconnect(); active.disconnect(); targets.forEach(el=>el.classList.remove('reveal-ready')); };
 }, []);
 return null;
}
