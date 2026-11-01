/** Local fallback logo (RuPaul's Drag Race). */
export const DEFAULT_FRANCHISE_IMAGE_URL = '/assets/images/franchises/rpdr.webp';

/**
 * Local franchise logos under `public/assets/images/franchises/`.
 * Keys match `FRANCHISE_NAMES`.
 */
export const FRANCHISE_IMAGE_URLS: Record<string, string> = {
  "RuPaul's Drag Race": '/assets/images/franchises/rpdr.webp',
  "RuPaul's Drag Race All Stars": '/assets/images/franchises/rpdr-as.webp',
  "RuPaul's Drag Race Global All Stars": '/assets/images/franchises/rpdr-gas.webp',
  "RuPaul's Drag Race UK": '/assets/images/franchises/rpdr-uk.webp',
  "RuPaul's Drag Race UK vs The World": '/assets/images/franchises/rpdr-uk-vs-tw.webp',
  "Canada's Drag Race": '/assets/images/franchises/cdr.webp',
  "Canada's Drag Race: Canada vs The World": '/assets/images/franchises/cdr-vs-tw.webp',
  "Canada's Drag Race: All Stars": '/assets/images/franchises/cdr-as.webp',
  'Drag Race Down Under': '/assets/images/franchises/drdu.webp',
  'Drag Race Down Under vs The World': '/assets/images/franchises/drdu-vs-tw.webp',
  'Drag Race Thailand': '/assets/images/franchises/drth.webp',
  'Drag Race Holland': '/assets/images/franchises/drhl.webp',
  'Drag Race España': '/assets/images/franchises/dres.webp',
  'Drag Race España: All Stars': '/assets/images/franchises/dres-as.webp',
  'Drag Race Italia': '/assets/images/franchises/drit.webp',
  'Drag Race France': '/assets/images/franchises/drfr.webp',
  'Drag Race France All Stars': '/assets/images/franchises/drfr-as.webp',
  'Drag Race Philippines': '/assets/images/franchises/drph.webp',
  'Drag Race Philippines: Slaysian Royale': '/assets/images/franchises/drph-sr.webp',
  'Drag Race Belgique': '/assets/images/franchises/drbe.webp',
  'Drag Race Sverige': '/assets/images/franchises/drsv.webp',
  'Drag Race México': '/assets/images/franchises/drmx.webp',
  'Drag Race México: Latina Royale': '/assets/images/franchises/drmx-lr.webp',
  'Drag Race Brasil': '/assets/images/franchises/drbr.webp',
  'Drag Race Germany': '/assets/images/franchises/drge.webp',
};

export function franchiseImageUrl(franchise: string): string {
  const custom = FRANCHISE_IMAGE_URLS[franchise]?.trim();
  return custom || DEFAULT_FRANCHISE_IMAGE_URL;
}
