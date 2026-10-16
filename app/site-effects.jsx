'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scrollbarTimer;
    const showScrollbar = () => {
      document.documentElement.classList.add('scrollbar-active');
      window.clearTimeout(scrollbarTimer);
      scrollbarTimer = window.setTimeout(() => document.documentElement.classList.remove('scrollbar-active'), 900);
    };
    window.addEventListener('scroll', showScrollbar, { passive: true });
    let revealObserver;
    let chapterVideoObserver;
    const chapterVideos = [...document.querySelectorAll('.chapter-video')];
    const playFromBurgerReveal = video => {
      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(3, Math.max(0, video.duration - .1));
      }
      video.play().catch(() => {});
    };
    const replayChapterVideo = event => playFromBurgerReveal(event.currentTarget);
    let revealTargets = [];
    let storyFrame;

    if (!motionPreference.matches && 'IntersectionObserver' in window) {
      const groups = [
        ['.hero-copy > *', 'rise', 75],
        ['.hero-visual', 'plate', 0],
        ['.section-top > *', 'rise', 100],
        ['.menu-card', 'serve', 130],
        ['.menu-footnote', 'rise', 0],
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

      chapterVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          if (entry.target.readyState >= 1) playFromBurgerReveal(entry.target);
          else {
            entry.target.addEventListener('loadedmetadata', () => playFromBurgerReveal(entry.target), { once: true });
            entry.target.load();
          }
          chapterVideoObserver.unobserve(entry.target);
        });
      }, { threshold: 0.25 });
      chapterVideos.forEach(video => {
        video.addEventListener('ended', replayChapterVideo);
        chapterVideoObserver.observe(video);
      });
    }

    const storySection = document.querySelector('.story-section');
    const travelingBurger = document.querySelector('.story-burger');
    const storyStops = [...document.querySelectorAll('[data-story-stop]')];
    const legs = [...document.querySelectorAll('[data-route-leg]')];
    const lengths = legs.map(leg => leg.getTotalLength());
    let target = 0, current = 0, previousTime = 0;
    const updateStoryJourney = (time) => {
      storyFrame = 0;
      if (!travelingBurger || legs.length !== 3) return;
      const dt = Math.min(time - (previousTime || time - 16), 64);
      previousTime = time;
      current += (target - current) * (1 - Math.exp(-dt / 65));
      if (Math.abs(target - current) < .0001) current = target;
      // Even chapters hold exactly at endpoints; odd chapters traverse one SVG leg.
      const chapter = Math.min(current * 7, 6.999999);
      const index = Math.floor(chapter);
      const stopped = index % 2 === 0;
      const stop = Math.floor(index / 2);
      const legIndex = Math.min(stop, 2);
      const blend = stopped ? (stop === 3 ? 1 : 0) : chapter - index;
      const eased = blend * blend * (3 - 2 * blend);
      const point = legs[legIndex].getPointAtLength(lengths[legIndex] * eased);
      travelingBurger.setAttribute('transform', `translate(${point.x} ${point.y})`);
      storyStops.forEach((city, i) => city.classList.toggle('is-active', stopped && i === stop));
      if (current !== target) storyFrame = window.requestAnimationFrame(updateStoryJourney);
      else previousTime = 0;
    };
    const requestStoryUpdate = () => {
      if (!storySection) return;
      const stage = storySection.querySelector('.story-route');
      const inset = parseFloat(getComputedStyle(stage).top) || 0;
      const range = Math.max(storySection.offsetHeight - stage.offsetHeight, 1);
      target = motionPreference.matches ? 0 : Math.max(0, Math.min(1, (inset - storySection.getBoundingClientRect().top) / range));
      if (motionPreference.matches) current = 0;
      if (!storyFrame) storyFrame = window.requestAnimationFrame(updateStoryJourney);
    };
    requestStoryUpdate();
    window.addEventListener('scroll', requestStoryUpdate, { passive: true });
    window.addEventListener('resize', requestStoryUpdate);
    motionPreference.addEventListener('change', requestStoryUpdate);

    const mainScript = document.createElement('script');
    mainScript.src = '/main.js';
    document.body.appendChild(mainScript);
    return () => {
      window.removeEventListener('scroll', showScrollbar);
      window.clearTimeout(scrollbarTimer);
      document.documentElement.classList.remove('scrollbar-active');
      revealObserver?.disconnect();
      chapterVideoObserver?.disconnect();
      chapterVideos.forEach(video => video.removeEventListener('ended', replayChapterVideo));
      window.cancelAnimationFrame(storyFrame);
      window.removeEventListener('scroll', requestStoryUpdate);
      window.removeEventListener('resize', requestStoryUpdate);
      motionPreference.removeEventListener('change', requestStoryUpdate);
      document.documentElement.classList.remove('motion-ready');
      revealTargets.forEach(element => {
        element.classList.remove('is-revealed');
        delete element.dataset.reveal;
        element.style.removeProperty('--reveal-delay');
      });
      mainScript.remove();
    };
  }, []);

  return null;
}
