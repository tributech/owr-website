// Newsletter metadata fetched from Contentful at build time.
//
// Used by /newsletter/index.astro (issue list) and /insights/index.astro
// (latest newsletter callout). Per-issue rendering happens in
// /newsletter/[slug].astro which fetches the full body separately.

import { getClient } from './contentful';
import type {
  NewsletterIssueSkeleton,
  NewsletterIssueEntry,
} from './contentful-types';

export type NewsletterMeta = {
  slug: string;
  title: string;
  preheader: string;
  publishedAt: string;
  heroImage: string;
};

export async function fetchNewsletters(): Promise<NewsletterMeta[]> {
  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.getEntries<NewsletterIssueSkeleton>({
      content_type: 'newsletterIssue',
      order: ['-fields.publishedAt'],
      // We only need top-level metadata here (no body / embeds).
      include: 0,
      select: [
        'fields.title',
        'fields.slug',
        'fields.preheader',
        'fields.publishedAt',
        'fields.heroImagePath',
      ],
    });
    return response.items.map(toMeta);
  } catch {
    return [];
  }
}

function toMeta(issue: NewsletterIssueEntry): NewsletterMeta {
  const f = issue.fields;
  return {
    slug: f.slug,
    title: f.title,
    preheader: f.preheader ?? '',
    publishedAt: f.publishedAt,
    heroImage: f.heroImagePath ?? '',
  };
}

export async function latestNewsletter(): Promise<NewsletterMeta | undefined> {
  const all = await fetchNewsletters();
  return all[0];
}

export function formatNewsletterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
