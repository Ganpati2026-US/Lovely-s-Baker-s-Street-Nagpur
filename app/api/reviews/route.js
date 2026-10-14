export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'no-store' };
export async function GET() {
 const key = process.env.GOOGLE_PLACES_API_KEY;
 const placeId = process.env.GOOGLE_PLACE_ID;
 if (!key || !placeId) return Response.json({ reviews: [], status: 'unconfigured' }, { headers });
 try {
  const response = await fetch('https://places.googleapis.com/v1/places/'+encodeURIComponent(placeId), {
   headers: { 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': 'reviews,googleMapsUri,attributions' },
   cache: 'no-store', signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) return Response.json({ reviews: [], status: 'unavailable' }, { status: 502, headers });
  const data = await response.json();
  return Response.json({ status: 'ready', reviews: (data.reviews || []).map(review => ({
   name: review.authorAttribution?.displayName || 'Google user',
   authorUrl: review.authorAttribution?.uri,
   rating: review.rating,
   text: review.originalText?.text || review.text?.text || '',
   url: review.googleMapsUri,
   date: review.relativePublishTimeDescription
  })), mapsUrl: data.googleMapsUri, attributions: data.attributions || [] }, { headers });
 } catch { return Response.json({ reviews: [], status: 'unavailable' }, { status: 502, headers }); }
}
