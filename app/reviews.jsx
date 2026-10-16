'use client';
import { useEffect, useRef, useState } from 'react';
import { reviewSnapshots } from './review-snapshots';
const safeLink = value => { try { const url = new URL(value); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; } };
export default function Reviews() {
 const section = useRef(null);
 const viewport = useRef(null);
 const resume = useRef(null);
 const [data, setData] = useState({ reviews: reviewSnapshots, status: 'screenshots' });
 const [paused, setPaused] = useState(false);
 const [manual, setManual] = useState(false);
 useEffect(() => {
  const controller = new AbortController();
  const fetchReviews = () => fetch('/api/reviews', { signal: controller.signal, cache: 'no-store' }).then(r=>r.json()).then(result=>{if(result.status === 'ready' && result.reviews?.length)setData(result);}).catch(()=>{});
  const observer = new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();fetchReviews();}}, { rootMargin: '250px' });
  observer.observe(section.current);
  return ()=>{observer.disconnect();controller.abort();clearTimeout(resume.current);};
 }, []);
 const swipe = () => { setManual(true);clearTimeout(resume.current);resume.current=setTimeout(()=>setManual(false),2200); };
 const reviews = data?.reviews || [];
 const repeated = reviews.length ? Array.from({length:Math.max(1,Math.ceil(4/reviews.length))},()=>reviews).flat() : [];
 const renderReview = (review,index,clone) => <article className="takeaway-review" key={index}>
 <div className="box-lid"><img className="review-box-logo" src="/lovely-logo.png" alt="Lovely's Baker Street" /><span>LOVELY'S BAKER STREET</span></div>
 <div className="box-content"><div className="review-paper"><div className="review-copy"><div className="review-stars" aria-label={review.rating+' out of 5 stars'}>{'★'.repeat(Math.max(0,Math.min(5,Math.round(review.rating || 0))))}<span aria-hidden="true">{'☆'.repeat(5-Math.max(0,Math.min(5,Math.round(review.rating || 0))))}</span></div>
 <h3>{safeLink(review.authorUrl) ? <a href={safeLink(review.authorUrl)} tabIndex={clone?-1:0}>{review.name}</a> : review.name}</h3>
 <p className="review-text">{review.text || 'This customer left a rating without written comments.'}</p>
 {review.date && <small>{review.date}</small>}
 {review.excerpt && <small>Review excerpt</small>}
 {safeLink(review.url) || safeLink(data?.mapsUrl) ? <a className="review-source" href={safeLink(review.url) || safeLink(data?.mapsUrl)} tabIndex={clone?-1:0}>Google Reviews ↗</a> : <span className="review-source">Google review</span>}</div></div></div>
 <div className="box-fold" aria-hidden="true">MADE FRESH. ALWAYS LOVELY.</div></article>;
 return <section ref={section} className="reviews-section" aria-labelledby="reviews-title"><header><p className="eyebrow">GOOD FOOD. LOVELY COMPANY.</p><h2 id="reviews-title">WHAT OUR FOODIES SAY <img className="review-heading-logo" src="/lovely-logo.png" alt="Lovely's Baker Street" /></h2><p>Real bites. Real smiles. Real reviews.</p></header>
 {reviews.length ? <><div className={'reviews-viewport'+(paused||manual?' is-paused':'')} ref={viewport} tabIndex="0" role="region" aria-label="Customer reviews. Swipe or use arrow keys to browse." onTouchStart={swipe} onTouchEnd={swipe} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();swipe();viewport.current.scrollBy({left:e.key==='ArrowRight'?340:-340,behavior:'smooth'});}}}>
 <div className="reviews-track" style={{'--review-duration':repeated.length*7+'s'}}><div className="reviews-group">{repeated.map((r,i)=>renderReview(r,i,false))}</div><div className="reviews-group" aria-hidden="true" inert>{repeated.map((r,i)=>renderReview(r,i,true))}</div></div></div>
 <div className="reviews-attribution"><img src="https://developers.google.com/static/maps/documentation/images/google_on_white.png" alt="Google" width="76" height="26"/>{safeLink(data.mapsUrl) && <a href={safeLink(data.mapsUrl)}>View on Google Maps ↗</a>}<button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?'Resume reviews':'Pause reviews'}</button></div>
 {data.attributions?.map((a,i)=><p className="review-provider" key={i}><a href={safeLink(a.providerUri)}>{a.provider}</a></p>)}
 <p className="reviews-policy">{data.status === 'screenshots' ? 'Selected customer reviews; some are excerpts. These are not live updates.' : 'A selection of reviews supplied by Google.'} <a href="https://support.google.com/local-listings/answer/9851099">How Google reviews work</a>.</p></> :
 <div className="reviews-empty" role="status"><img className="review-empty-logo" src="/lovely-logo.png" alt="Lovely's Baker Street" /><p>{!data?'Loading customer reviews…':'Google reviews are currently unavailable. Please check back soon.'}</p></div>}
 <p className="reviews-policy"><a href="/terms">Terms</a> · <a href="/privacy">Privacy</a></p></section>;
}
