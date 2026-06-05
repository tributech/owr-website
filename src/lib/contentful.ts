import { createClient, type ContentfulClientApi } from 'contentful';

const space = import.meta.env.CONTENTFUL_SPACE_ID;
const deliveryToken = import.meta.env.CONTENTFUL_DELIVERY_TOKEN;
const previewToken = import.meta.env.CONTENTFUL_PREVIEW_TOKEN;

const isPreview = import.meta.env.DEV && !!previewToken;

const isConfigured = !!space && !!(deliveryToken || previewToken);

let _client: ContentfulClientApi<undefined> | undefined;

/**
 * Returns the Contentful client, or `null` if env vars are not set.
 * Pages should handle `null` gracefully (render empty state).
 */
export function getClient(): ContentfulClientApi<undefined> | null {
  if (!isConfigured) return null;
  if (_client) return _client;
  _client = createClient({
    space,
    accessToken: isPreview ? previewToken : deliveryToken,
    host: isPreview ? 'preview.contentful.com' : 'cdn.contentful.com',
  });
  return _client;
}

/**
 * Apply Contentful Image API transforms to an asset URL.
 *
 * Contentful resizes/reformats on the fly via query params, so we never hand a
 * raw multi-MB original to a browser or social scraper. Non-Contentful URLs
 * (and falsy input) are returned normalised but untransformed, so this is safe
 * to call on any image path.
 *
 * @param assetUrl A Contentful asset URL (may start with `//`).
 * @param opts     `w`/`h` in px, `q` quality 1-100, `fm` output format.
 */
export function cfImageUrl(
  assetUrl: string | undefined | null,
  opts: { w?: number; h?: number; q?: number; fm?: 'jpg' | 'png' | 'webp' | 'avif' } = {},
): string | undefined {
  if (!assetUrl) return undefined;
  const url = assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
  if (!url.includes('images.ctfassets.net')) return url;
  const params = new URLSearchParams();
  if (opts.w) params.set('w', String(opts.w));
  if (opts.h) params.set('h', String(opts.h));
  params.set('q', String(opts.q ?? 80));
  if (opts.fm) params.set('fm', opts.fm);
  return `${url}?${params.toString()}`;
}

/**
 * Build a social-share-optimised image URL. OG/Twitter scrapers (WhatsApp
 * rejects previews over ~600KB) want a small JPG, so cap width and re-encode.
 */
export function ogImageUrl(assetUrl: string | undefined | null): string | undefined {
  return cfImageUrl(assetUrl, { w: 1200, q: 80, fm: 'jpg' });
}
