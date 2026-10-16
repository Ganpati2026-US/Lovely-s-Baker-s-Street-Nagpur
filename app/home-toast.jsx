'use client';

import { useEffect, useState } from 'react';

export default function HomeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = () => setVisible(true);
    window.addEventListener('lovely-brand-sheet', show);
    return () => {
      window.removeEventListener('lovely-brand-sheet', show);
    };
  }, []);

  return <div className={'brand-sheet' + (visible ? ' is-visible' : '')} role="dialog" aria-modal="false" aria-label="Lovely's Baker Street" aria-hidden={!visible}>
    <button className="brand-sheet-close" type="button" aria-label="Close" onClick={() => setVisible(false)}><img src="/lovely-logo.png" alt="" /></button>
    <div className="brand-sheet-card">
      <span>LOVELY&apos;S BAKER STREET</span>
      <strong>BEST BURGER<br />OF INDIA</strong>
      <p>Customers have trusted and enjoyed every bite since 2015.</p>
    </div>
  </div>;
}
