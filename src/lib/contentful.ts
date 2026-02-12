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
