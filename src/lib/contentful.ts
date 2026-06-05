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
 * Build a social-share-optimised image URL from a Contentful asset URL.
 *
 * Contentful's Image API resizes/reformats on the fly via query params, so we
 * never want to hand a raw multi-MB original to OG/Twitter scrapers. WhatsApp,
 * for example, rejects previews over ~600KB. Re-encoding to JPG at a capped
 * width keeps social images small without touching the source asset.
 *
 * @param assetUrl A Contentful asset URL (may start with `//`). Non-Contentful
 *                 URLs are returned normalised but untransformed.
 */
export function ogImageUrl(assetUrl: string | undefined | null): string | undefined {
  if (!assetUrl) return undefined;
  const url = assetUrl.startsWith('//') ? `https:${assetUrl}` : assetUrl;
  if (!url.includes('images.ctfassets.net')) return url;
  return `${url}?fm=jpg&w=1200&q=80`;
}
