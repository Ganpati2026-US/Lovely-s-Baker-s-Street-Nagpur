'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
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
      effectsScript.remove();
      mainScript.remove();
    };
  }, []);

  return null;
}
