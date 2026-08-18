#!/usr/bin/env node
// Render a Contentful newsletterIssue to:
//   1. An MJML body fragment that slots into the existing Heya/campaign-mailer
//      layout on the Rails side.
//   2. A plain-text fallback for the email's text/plain part.
//   3. A small JSON sidecar with subject, preheader, category, region, and
//      web URL — useful for pasting into the god-admin form.
//
// Usage:
//   pnpm newsletter:render <slug>
//   node tools/newsletter/render.mjs may-2026
//
// Outputs to tools/newsletter/out/<slug>.{mjml,txt,json}
//
// Reads from .env.local: CONTENTFUL_SPACE_ID, CONTENTFUL_DELIVERY_TOKEN
// (and optionally PUBLIC_APP_URL for the canonical web URL prefix).

import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv, exit, env, loadEnvFile } from 'node:process';

const here = dirname(fileURLToPath(import.meta.url));
// Astro convention: .env (committed defaults) + .env.local (private/overrides).
// Load both with .env.local taking precedence.
const envRoot = resolve(here, '..', '..');
for (const f of ['.env', '.env.local']) {
  const p = resolve(envRoot, f);
  if (existsSync(p)) loadEnvFile(p);
}

const SPACE = env.CONTENTFUL_SPACE_ID ?? 'ry0ysk99xuno';
const TOKEN = env.CONTENTFUL_DELIVERY_TOKEN;
const APP_URL = (env.PUBLIC_APP_URL ?? 'https://oldworldrankings.com').replace(/\/$/, '');
const WEB_URL = (env.PUBLIC_WEB_URL ?? 'https://www.oldworldrankings.com').replace(/\/$/, '');

// Store links stay untagged: external hosts, and Play attribution uses its own referrer param.
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.oldworldrankings.android';
const APP_STORE_URL = 'https://apps.apple.com/app/id6757371153';

if (!TOKEN) die('Missing CONTENTFUL_DELIVERY_TOKEN in .env.local');

const slug = argv[2];
if (!slug) die('Usage: render.mjs <slug>');

// --- Fetch entry + resolved includes ---

const apiUrl = new URL(`https://cdn.contentful.com/spaces/${SPACE}/environments/master/entries`);
apiUrl.searchParams.set('content_type', 'newsletterIssue');
apiUrl.searchParams.set('fields.slug', slug);
apiUrl.searchParams.set('include', '3');
apiUrl.searchParams.set('access_token', TOKEN);

const data = await (await fetch(apiUrl)).json();
const entry = data.items?.[0];
if (!entry) die(`No newsletterIssue with slug "${slug}" found in Contentful.`);

const entryById = new Map((data.includes?.Entry ?? []).map((e) => [e.sys.id, e]));
const fields = entry.fields;

// --- Rendering ---

// Convert a relative path like "/images/newsletter/foo.jpg" to an absolute
// website URL. Email clients only accept absolute https URLs for images.
function absUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${WEB_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// ---- UTM tagging ----
//
// Every link out of the newsletter into a site we own gets tagged here rather
// than by hand in Contentful, so an issue can't ship with links that are
// missing, misspelled, or copy-pasted from last month's campaign.
//
//   utm_source=newsletter, utm_medium=email, utm_campaign=<issue slug>,
//   utm_content=<section slug or embed kind>
//
// Note this is deliberately NOT the same scheme as AdServing::DestinationUrlBuilder
// in the Rails app. That one tags links pointing outward to a sponsor's site,
// where OWR is the source; these point inward, where the newsletter is.

const UTM_SOURCE = 'newsletter';
const UTM_MEDIUM = 'email';

// Only hosts whose GA4 we own. Anything else (YouTube, the help centre) is
// left untouched, since the params would just ride along unread.
const TRACKED_HOSTS = new Set(['oldworldrankings.com', 'www.oldworldrankings.com']);

// utm_content for links in the issue body, tracked as the block walker passes
// each heading so a click can be traced back to the section it sat under.
let currentSection = 'intro';

function sectionSlug(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'body';
}

function withUtm(rawUrl, content) {
  if (!rawUrl || rawUrl.startsWith('#')) return rawUrl;

  let url;
  try {
    url = new URL(rawUrl, WEB_URL);
  } catch {
    return rawUrl;
  }

  if (!TRACKED_HOSTS.has(url.hostname)) return rawUrl;
  // Sponsor click-throughs get their own UTMs from DestinationUrlBuilder when
  // Rails redirects them. Tagging here would be discarded at best and skew the
  // sponsor reports at worst.
  if (url.pathname.startsWith('/sponsor-ads/')) return rawUrl;
  // A hand-tagged link in Contentful is a deliberate override; leave it alone.
  if (url.searchParams.has('utm_source')) return rawUrl;

  url.searchParams.set('utm_source', UTM_SOURCE);
  url.searchParams.set('utm_medium', UTM_MEDIUM);
  url.searchParams.set('utm_campaign', slug);
  if (content) url.searchParams.set('utm_content', content);
  return url.toString();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Inline rich-text rendering (per text/inline node) ----

const STRONG_STYLE = 'color: #1C1C1C; font-weight: 700;';
const LINK_STYLE = 'color: #DAA520; text-decoration: underline;';
const BADGE_STYLE = 'display: inline-block; background-color: #FFD700; color: #1C1C1C; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 4px;';

function renderInline(node) {
  if (node.nodeType === 'text') {
    let text = escapeHtml(node.value);
    const marks = (node.marks ?? []).map((m) => m.type);
    if (marks.includes('code')) {
      return `<span style="${BADGE_STYLE}">${text}</span>`;
    }
    if (marks.includes('bold')) text = `<strong style="${STRONG_STYLE}">${text}</strong>`;
    if (marks.includes('italic')) text = `<em>${text}</em>`;
    if (marks.includes('underline')) text = `<u>${text}</u>`;
    return text;
  }
  if (node.nodeType === 'hyperlink') {
    const uri = withUtm(node.data?.uri ?? '#', currentSection);
    const inner = (node.content ?? []).map(renderInline).join('');
    return `<a href="${escapeHtml(uri)}" style="${LINK_STYLE}">${inner}</a>`;
  }
  // Fallback: walk children
  if (Array.isArray(node.content)) return node.content.map(renderInline).join('');
  return '';
}

function inlineText(node) {
  if (node.nodeType === 'text') return node.value;
  if (node.nodeType === 'hyperlink') {
    const inner = (node.content ?? []).map(inlineText).join('');
    const raw = node.data?.uri ?? '';
    // Tagged here too: an untagged text/plain click lands in GA4 as direct and
    // quietly under-counts the issue.
    const uri = withUtm(raw, currentSection);
    return uri && raw !== inner ? `${inner} (${uri})` : inner;
  }
  if (Array.isArray(node.content)) return node.content.map(inlineText).join('');
  return '';
}

// ---- Block rendering ----

function renderBlock(node) {
  switch (node.nodeType) {
    case 'paragraph':
      return mjText(node.content.map(renderInline).join(''));
    case 'heading-2':
      currentSection = sectionSlug(node.content.map(inlineText).join(''));
      return mjText(node.content.map(renderInline).join(''), {
        fontSize: '22px', fontWeight: 'bold', paddingTop: '20px',
      });
    case 'heading-3':
      return mjText(node.content.map(renderInline).join(''), {
        fontSize: '18px', fontWeight: 'bold', paddingTop: '14px',
      });
    case 'unordered-list':
      return mjList('ul', node.content);
    case 'ordered-list':
      return mjList('ol', node.content);
    case 'hr':
      return mjSection(`<mj-divider border-color="#e5e7eb" border-width="1px" padding="12px 25px" />`);
    case 'blockquote':
      return mjText(
        `<div style="border-left: 3px solid #DAA520; padding: 4px 14px; color: #555; font-style: italic;">${
          node.content.map((child) => `<p style="margin:0 0 8px 0;">${child.content.map(renderInline).join('')}</p>`).join('')
        }</div>`,
      );
    case 'table':
      return mjText(renderTable(node));
    case 'embedded-asset-block':
    case 'embedded-entry-block':
      return renderEmbed(node);
    default:
      return '';
  }
}

function renderEmbed(node) {
  const id = node.data?.target?.sys?.id;
  const target = id ? entryById.get(id) : null;
  if (!target) return `<!-- unresolved embed: ${id} -->`;

  const ct = target.sys.contentType?.sys?.id;
  const f = target.fields;

  if (ct === 'imageReference') {
    const url = absUrl(f.path);
    const alt = f.alt ?? '';
    const caption = f.caption;
    const captionMjml = caption
      ? `<mj-text font-size="13px" color="#666" align="center" padding-top="6px">${escapeHtml(caption)}</mj-text>`
      : '';
    return `<mj-section padding="12px 25px" background-color="#ffffff">
  <mj-column>
    <mj-image src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" border-radius="6px" />
    ${captionMjml}
  </mj-column>
</mj-section>`;
  }

  if (ct === 'newsletterEmbed') {
    return renderNewsletterEmbed(f.kind, f);
  }

  return `<!-- unknown embed contentType: ${ct} -->`;
}

function renderNewsletterEmbed(kind, fields = {}) {
  if (kind === 'mobile-beta-preview') {
    const ios = absUrl('/images/mobile/ios-tester-screen-1.png');
    const droid = absUrl('/images/mobile/android-tester-screen-1.png');
    return `<mj-section padding="20px 25px" background-color="#ffffff">
  <mj-group>
    <mj-column width="50%">
      <mj-image src="${ios}" alt="OWR iOS app screenshot" border-radius="20px" />
      <mj-text align="center" font-size="13px" color="#666">iOS</mj-text>
    </mj-column>
    <mj-column width="50%">
      <mj-image src="${droid}" alt="OWR Android app screenshot" border-radius="20px" />
      <mj-text align="center" font-size="13px" color="#666">Android</mj-text>
    </mj-column>
  </mj-group>
</mj-section>`;
  }

  if (kind === 'store-badges') {
    const play = absUrl('/images/store/google-play-badge.png');
    const apple = absUrl('/images/store/app-store-badge.png');
    return `<mj-section padding="8px 25px 20px 25px" background-color="#ffffff">
  <mj-group>
    <mj-column width="50%">
      <mj-image src="${apple}" alt="Download on the App Store" href="${APP_STORE_URL}" width="150px" align="right" padding="8px" />
    </mj-column>
    <mj-column width="50%">
      <mj-image src="${play}" alt="Get it on Google Play" href="${PLAY_STORE_URL}" width="169px" align="left" padding="8px" />
    </mj-column>
  </mj-group>
</mj-section>`;
  }

  if (kind === 'sponsor-cards') {
    const cards = [
      {
        name: 'Mighty Melee Games',
        logo: absUrl('/images/sponsors/mighty-melee.png'),
        href: 'https://oldworldrankings.com/sponsor-ads/3261e4a2-1c0e-43ed-814e-947116283ec5/click?scope=regional',
      },
      {
        name: 'UK Resin Prints',
        logo: absUrl('/images/sponsors/ukresinprints.png'),
        href: 'https://oldworldrankings.com/sponsor-ads/801b6b36-7440-407b-b82e-42cd3e6012c2/click?scope=regional',
      },
    ];
    const cols = cards.map((c) => `    <mj-column width="50%">
      <mj-image src="${c.logo}" alt="${escapeHtml(c.name)}" href="${escapeHtml(c.href)}" padding="8px" />
      <mj-text align="center" font-size="13px" color="#666" padding-top="0">${escapeHtml(c.name)}</mj-text>
    </mj-column>`).join('\n');
    return `<mj-section padding="20px 25px" background-color="#ffffff">
  <mj-group>
${cols}
  </mj-group>
</mj-section>`;
  }

  if (kind === 'cta-host-tournament') {
    return `<mj-section padding="24px 25px" background-color="#ffffff">
  <mj-column>
    <mj-button background-color="#FFD700" color="#1C1C1C" font-weight="700" border-radius="8px" href="${escapeHtml(withUtm(`${APP_URL}/host`, kind))}" padding="12px 0">Host a tournament &rarr;</mj-button>
  </mj-column>
</mj-section>`;
  }

  if (kind === 'region-spotlight-ph') {
    const eventUrl = escapeHtml(withUtm(`${APP_URL}/ph/tournaments/b-i-a-brother-in-arms-cup-2026`, kind));
    const groundsUrl = escapeHtml(withUtm(`${WEB_URL}/newsletter/${slug}/#around-the-grounds`, kind));
    return `<mj-section padding="16px 25px" background-color="#ffffff">
  <mj-column background-color="#F9FAFB" border="1px solid #e5e7eb" border-radius="12px" padding="20px">
    <mj-text font-size="12px" font-weight="700" letter-spacing="0.5px" text-transform="uppercase" color="#DAA520">New on the map</mj-text>
    <mj-text font-size="16px" font-weight="700" color="#1C1C1C" padding-top="4px">The Philippines has its first hosted event on OWR</mj-text>
    <mj-text font-size="14px" color="#444" line-height="1.55" padding-top="4px"><a href="${eventUrl}" style="${LINK_STYLE}">B.I.A. Brother In Arms Cup</a> runs 4 September in a 16-player, 3-round format. Old World events on OWR now span 24 regions. Mabuhay! &#127477;&#127469;
    More event news in <a href="${groundsUrl}" style="${LINK_STYLE}">Around the grounds</a> below.</mj-text>
  </mj-column>
</mj-section>`;
  }

  if (kind === 'testimonial-owr') {
    return `<mj-section padding="16px 25px" background-color="#ffffff">
  <mj-column width="90%">
    <mj-text font-size="12px" color="#888" padding-bottom="4px">A tournament organiser, in our Discord</mj-text>
    <mj-text font-size="16px" color="#1C1C1C" background-color="#F3F4F6" border-radius="16px" padding="14px 18px" line-height="1.5">Software is a dream, I&#39;m never running an event without it ever again &#128514;</mj-text>
  </mj-column>
</mj-section>`;
  }

  if (kind === 'pro-callout') {
    // Per-issue lead-in (the list of things this issue shipped) comes from the
    // entry's text field; the rest of the callout is evergreen.
    const intro = fields.text ? `${escapeHtml(fields.text)} ` : '';
    return `<mj-section padding="32px 25px 16px 25px" background-color="#ffffff">
  <mj-column background-color="#FFFAE5" border="1px solid #FFD700" border-radius="12px" padding="24px">
    <mj-text font-size="20px" font-weight="bold" color="#1C1C1C">Built by Pro supporters</mj-text>
    <mj-text font-size="15px" color="#333" line-height="1.55">${intro}Every single thing in this newsletter got built because <a href="${escapeHtml(withUtm(`${APP_URL}/pricing`, kind))}" style="${LINK_STYLE}"><strong style="${STRONG_STYLE}">OWR Pro</strong></a> supporters are funding it.</mj-text>
    <mj-text font-size="15px" color="#333" line-height="1.55">Genuine thanks to everyone who jumped on early. You're the reason this is shipping at the pace it is, and the reason we can keep building.</mj-text>
    <mj-text font-size="13px" color="#666" line-height="1.55">If you've been on the fence, OWR Pro is the lever. Ad-free browsing, the full tournament hosting toolkit, and you're directly fuelling the next batch of work.</mj-text>
    <mj-button background-color="#FFD700" color="#1C1C1C" font-weight="700" border-radius="8px" href="${escapeHtml(withUtm(`${APP_URL}/pricing`, kind))}" padding="12px 0">Become an OWR Pro supporter &rarr;</mj-button>
  </mj-column>
</mj-section>`;
  }

  return `<!-- unknown newsletterEmbed kind: ${kind} -->`;
}

function renderTable(node) {
  const rows = (node.content ?? []).map((row) => {
    const cells = (row.content ?? []).map((cell) => {
      const tag = cell.nodeType === 'table-header-cell' ? 'th' : 'td';
      const inner = (cell.content ?? []).map((p) => p.content?.map(renderInline).join('') ?? '').join('<br/>');
      const style = tag === 'th'
        ? 'background:#f9fafb; padding:8px 10px; border:1px solid #e5e7eb; text-align:left; font-weight:600;'
        : 'padding:8px 10px; border:1px solid #e5e7eb;';
      return `<${tag} style="${style}">${inner}</${tag}>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  return `<table style="width:100%; border-collapse: collapse; border: 1px solid #e5e7eb;">${rows}</table>`;
}

function mjText(html, opts = {}) {
  const attrs = [];
  if (opts.fontSize) attrs.push(`font-size="${opts.fontSize}"`);
  if (opts.fontWeight) attrs.push(`font-weight="${opts.fontWeight}"`);
  if (opts.paddingTop) attrs.push(`padding-top="${opts.paddingTop}"`);
  const attrStr = attrs.length ? ` ${attrs.join(' ')}` : '';
  return `<mj-section padding="0 25px" background-color="#ffffff">
  <mj-column>
    <mj-text${attrStr}>${html}</mj-text>
  </mj-column>
</mj-section>`;
}

function mjSection(inner) {
  return `<mj-section padding="0 25px" background-color="#ffffff">
  <mj-column>
    ${inner}
  </mj-column>
</mj-section>`;
}

function mjList(tag, items) {
  const lis = items.map((li) => {
    const inner = (li.content ?? []).map((para) =>
      (para.content ?? []).map(renderInline).join(''),
    ).join('<br/>');
    return `<li style="margin-bottom:6px;">${inner}</li>`;
  }).join('');
  return mjText(`<${tag} style="margin:0; padding-left:20px;">${lis}</${tag}>`);
}

function renderBody(doc) {
  if (!doc?.content) return { mjml: '', text: '' };
  // Two independent walks over the same doc, so the section cursor resets
  // before each or the text pass would start wherever the MJML pass ended.
  currentSection = 'intro';
  const mjmlChunks = doc.content.map(renderBlock).filter(Boolean);
  currentSection = 'intro';
  const text = renderText(doc);
  return { mjml: mjmlChunks.join('\n\n'), text };
}


// ---- Plain-text walker ----

function renderText(doc) {
  const lines = [];
  for (const node of doc.content ?? []) {
    lines.push(renderTextBlock(node));
  }
  return lines.filter((l) => l !== null).join('\n\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function renderTextBlock(node) {
  switch (node.nodeType) {
    case 'paragraph':
      return node.content.map(inlineText).join('');
    case 'heading-2': {
      const heading = node.content.map(inlineText).join('');
      currentSection = sectionSlug(heading);
      return `## ${heading}`;
    }
    case 'heading-3':
      return `### ${node.content.map(inlineText).join('')}`;
    case 'unordered-list':
      return node.content.map((li) => `- ${liText(li)}`).join('\n');
    case 'ordered-list':
      return node.content.map((li, i) => `${i + 1}. ${liText(li)}`).join('\n');
    case 'hr':
      return '---';
    case 'blockquote':
      return node.content.map((p) => `> ${p.content.map(inlineText).join('')}`).join('\n');
    case 'table':
      return renderTextTable(node);
    case 'embedded-asset-block':
    case 'embedded-entry-block':
      return renderTextEmbed(node);
    default:
      return null;
  }
}

function liText(li) {
  return (li.content ?? []).map((p) => p.content?.map(inlineText).join('') ?? '').join(' ');
}

function renderTextTable(node) {
  return (node.content ?? []).map((row) =>
    (row.content ?? []).map((cell) =>
      (cell.content ?? []).map((p) => p.content?.map(inlineText).join('') ?? '').join(' '),
    ).join(' | '),
  ).join('\n');
}

function renderTextEmbed(node) {
  const id = node.data?.target?.sys?.id;
  const target = id ? entryById.get(id) : null;
  if (!target) return null;
  const ct = target.sys.contentType?.sys?.id;
  const f = target.fields;
  if (ct === 'imageReference') {
    const caption = f.caption ? `: ${f.caption}` : '';
    return `[Image: ${f.alt}${caption}]`;
  }
  if (ct === 'newsletterEmbed') {
    if (f.kind === 'mobile-beta-preview') return '[Mobile beta preview: iOS and Android screenshots]';
    if (f.kind === 'store-badges') return `Get the OWR app - App Store: ${APP_STORE_URL} / Google Play: ${PLAY_STORE_URL}`;
    if (f.kind === 'sponsor-cards') return '[Sponsors: Mighty Melee Games, UK Resin Prints]';
    if (f.kind === 'cta-host-tournament') return `Host a tournament: ${withUtm(`${APP_URL}/host`, f.kind)}`;
    if (f.kind === 'pro-callout') return `Built by Pro supporters. ${f.text ? `${f.text} ` : ''}Every single thing in this newsletter got built because OWR Pro supporters are funding it: ${withUtm(`${APP_URL}/pricing`, f.kind)}`;
    if (f.kind === 'region-spotlight-ph') return `New on the map: The Philippines has its first hosted event on OWR. B.I.A. Brother In Arms Cup runs 4 September, 16-player 3-round format. ${withUtm(`${APP_URL}/ph/tournaments/b-i-a-brother-in-arms-cup-2026`, f.kind)}`;
    if (f.kind === 'testimonial-owr') return `"Software is a dream, I'm never running an event without it ever again" - A tournament organiser, in our Discord`;
  }
  return null;
}

// --- Output ---
//
// Header (title, preheader, feature image) is NOT prepended to the MJML body.
// Those live as separate fields on the Rails Newsletter model and are
// rendered by the dedicated newsletter_mailer.html.mjml layout. The body
// MJML is just the issue's content; the layout handles framing.

const { mjml: mjmlBody, text: textBody } = renderBody(fields.body);

// Sidecar mirrors every field on the Rails Newsletter form.
// Camel and snake_case keys are both included so it's friendly to either
// JS or Ruby paste targets.
const featureImageUrl = fields.heroImagePath ? absUrl(fields.heroImagePath) : null;
// Canonical URL for the issue's web page. Deliberately untagged: it is the
// og:url / "view in browser" target, and campaign params on a canonical URL
// fragment the page's analytics.
const webUrl = `${WEB_URL}/newsletter/${fields.slug}/`;

const sidecar = {
  slug: fields.slug,
  title: fields.title,
  subject: fields.subject,
  preheader: fields.preheader ?? '',
  category: fields.category,
  region: fields.region ?? null,
  published_at: fields.publishedAt,
  web_url: webUrl,
  feature_image_url: featureImageUrl,
  // Camel-cased aliases for non-Rails consumers.
  publishedAt: fields.publishedAt,
  webUrl,
  featureImageUrl,
};

// The committed .env points PUBLIC_APP_URL at local dev for the Astro site's
// benefit, which is wrong for a newsletter: the output is a shipping artifact.
// Dev URLs are unreachable from an inbox and fail the tracked-host check, so
// they would go out both broken and untagged. Warn rather than fail, since a
// local render is a legitimate way to eyeball layout.
const untrackedBases = [...new Set([APP_URL, WEB_URL])].filter((base) => {
  try {
    return !TRACKED_HOSTS.has(new URL(base).hostname);
  } catch {
    return true;
  }
});
if (untrackedBases.length) {
  console.error('');
  console.error(`WARNING: rendering against non-production URLs: ${untrackedBases.join(', ')}`);
  console.error('  Links to these hosts are NOT UTM-tagged and must not be sent.');
  console.error('  For a sendable render, override the base URLs:');
  console.error(`    PUBLIC_APP_URL=https://oldworldrankings.com pnpm newsletter:render ${slug}`);
  console.error('');
}

const outDir = resolve(here, 'out');
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, `${slug}.mjml`), mjmlBody);
await writeFile(resolve(outDir, `${slug}.txt`), textBody);
await writeFile(resolve(outDir, `${slug}.json`), JSON.stringify(sidecar, null, 2));

console.error(`Wrote out/${slug}.mjml (${mjmlBody.length} bytes)`);
console.error(`Wrote out/${slug}.txt  (${textBody.length} bytes)`);
console.error(`Wrote out/${slug}.json`);
console.error('');
console.error('Form values to paste into Rails newsletter admin:');
console.error('  Subject:           ' + sidecar.subject);
console.error('  Preheader:         ' + sidecar.preheader);
console.error('  Category:          ' + sidecar.category + (sidecar.region ? ` (region: ${sidecar.region})` : ''));
console.error('  Web URL:           ' + sidecar.web_url);
console.error('  Feature image URL: ' + (sidecar.feature_image_url ?? '(none)'));

function die(msg) {
  console.error(msg);
  exit(1);
}
