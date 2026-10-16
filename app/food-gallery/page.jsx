import SiteNav from '../site-nav';
import Gallery from './gallery';
export const metadata = { title: "Food Gallery | Lovely's Baker Street" };
export default function GalleryPage() { return <><SiteNav /><main className="brand-page"><header className="brand-heading"><p>FRESH FROM OUR KITCHEN</p><h1>A CLOSER LOOK<br />AT THE <em>LOVELY STACK.</em></h1><p>Good food. Up close. Explore the little details that make a Lovely's table.</p></header><Gallery /></main></>; }
