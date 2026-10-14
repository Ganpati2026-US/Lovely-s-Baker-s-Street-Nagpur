'use client';
import { useEffect, useRef, useState } from 'react';
const photos = [
 {src:'DSC01024',name:"The Lovely's Burger",category:'Burgers',alt:"Lovely's burger in its branded tray"},
 {src:'DSC01130',name:'Loaded Nachos',category:'From the kitchen',alt:'Loaded nachos with cheese and sauce'},
 {src:'DSC01064',name:'Toasted Wrap',category:'From the kitchen',alt:'Toasted wrap with signature sauce'},
 {src:'DSC01175',name:'The Lovely’s Table',category:'From the kitchen',alt:'A spread of burgers, wraps and nachos'}
];
const categories = ['All','Burgers','Pizza','Pasta','French Fries','Chicken Wings','Chicken Bucket','Chicken Popcorn','Onion Rings','Spaghetti','From the kitchen'];
export default function Gallery() {
 const [filter,setFilter] = useState('All');
 const [selected,setSelected] = useState(0);
 const dialog = useRef(null);
 const grid = useRef(null);
 const filtered = photos.filter(photo=>filter === 'All' || photo.category === filter);
 useEffect(()=>{
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(entry.isIntersecting) {entry.target.classList.add('in-view');observer.unobserve(entry.target);}
  }), {threshold:.05});
  const cards = [...grid.current.querySelectorAll('.gallery-card')];
  cards.forEach(card=>{card.classList.add('reveal-ready');observer.observe(card);});
  return ()=>observer.disconnect();
 },[filter]);
 const move = direction => setSelected(value=>(value+direction+filtered.length)%filtered.length);
 const open = index => { setSelected(index); dialog.current.showModal(); };
 const photo = filtered[selected];
 return <section className="gallery-section"><div className="gallery-filters" aria-label="Filter food photos">{categories.map(category=><button key={category} aria-pressed={filter===category} onClick={()=>{setFilter(category);setSelected(0);}}>{category}</button>)}</div>
 <div className="editorial-grid" ref={grid}>{filtered.map((photo,index)=><button className="gallery-card" key={photo.src} onClick={()=>open(index)} aria-label={'Enlarge '+photo.name} onPointerMove={event=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches || event.pointerType==='touch')return;const r=event.currentTarget.getBoundingClientRect();event.currentTarget.style.setProperty('--pan',((event.clientY-r.top)/r.height-.5)*10+'px');}} onPointerLeave={event=>event.currentTarget.style.setProperty('--pan','0px')}>
 <div className="gallery-image"><img src={'/'+photo.src+'-960.webp'} srcSet={'/'+photo.src+'-960.webp 960w, /'+photo.src+'-1600.webp 1600w'} sizes="(max-width: 650px) 100vw, 60vw" loading="lazy" alt={photo.alt}/><span>VIEW ↗</span></div><div className="gallery-caption"><h2>{photo.name}</h2><span>{String(index+1).padStart(2,'0')}</span></div></button>)}
 {!filtered.length && <div className="gallery-empty"><span>PHOTOGRAPHY COMING SOON</span><h2>{filter}</h2><p>A fresh close-up is on its way. Explore the menu in the meantime.</p><a className="button button-red" href="/menu">Explore the menu ↗</a></div>}</div>
 <dialog className="food-lightbox" ref={dialog} onClick={event=>{if(event.target===event.currentTarget)dialog.current.close();}} onKeyDown={event=>{if(event.key==='ArrowRight'){event.preventDefault();move(1);}if(event.key==='ArrowLeft'){event.preventDefault();move(-1);}}}>
 <button className="lightbox-close" autoFocus onClick={()=>dialog.current.close()} aria-label="Close photo">Close ×</button>
 {photo && <figure><img src={'/'+photo.src+'.jpg'} alt={photo.alt}/><figcaption>{photo.name} · {selected+1} / {filtered.length}</figcaption></figure>}
 <div className="lightbox-controls"><button onClick={()=>move(-1)} aria-label="Previous photo">← Previous</button><button onClick={()=>move(1)} aria-label="Next photo">Next →</button></div></dialog></section>;
}
