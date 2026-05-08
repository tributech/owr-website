// Shared newsletter metadata.
// Eventually replaced by a Contentful-driven list. For now, hardcoded so
// the index, insights callout, and individual issue pages stay in sync.

export type NewsletterMeta = {
  slug: string;
  title: string;
  preheader: string;
  publishedAt: string;
  heroImage: string;
};

export const NEWSLETTERS: NewsletterMeta[] = [
  {
    slug: 'may-2026',
    title: 'Roll with your mates',
    preheader: 'Team tournaments are first-class, captains can pay for their mates, Battle Hub got the player rebuild, secondary scoring is fully flexible, mobile apps hit private beta, and the first sponsors are live.',
    publishedAt: '2026-05-08',
    heroImage: '/images/newsletter/may-2026-hero.jpg',
  },
];

export function latestNewsletter(): NewsletterMeta | undefined {
  return [...NEWSLETTERS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
}

export function formatNewsletterDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
