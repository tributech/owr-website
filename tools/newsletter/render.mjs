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
    const uri = node.data?.uri ?? '#';
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
    const uri = node.data?.uri ?? '';
    return uri && uri !== inner ? `${inner} (${uri})` : inner;
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
    return renderNewsletterEmbed(f.kind);
  }

  return `<!-- unknown embed contentType: ${ct} -->`;
}

function renderNewsletterEmbed(kind) {
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
    <mj-button background-color="#FFD700" color="#1C1C1C" font-weight="700" border-radius="8px" href="${APP_URL}/host" padding="12px 0">Host a tournament &rarr;</mj-button>
  </mj-column>
</mj-section>`;
  }

  if (kind === 'pro-callout') {
    return `<mj-section padding="32px 25px 16px 25px" background-color="#ffffff">
  <mj-column background-color="#FFFAE5" border="1px solid #FFD700" border-radius="12px" padding="24px">
    <mj-text font-size="20px" font-weight="bold" color="#1C1C1C">Built by Pro supporters</mj-text>
    <mj-text font-size="15px" color="#333" line-height="1.55">Team tournaments. The Battle Hub rebuild. Secondary scoring. Mobile beta. The OG image work. The sponsorship system. The handful of quality-of-life wins above. Every single thing in this newsletter got built because <a href="${APP_URL}/pricing" style="${LINK_STYLE}"><strong style="${STRONG_STYLE}">OWR Pro</strong></a> supporters are funding it.</mj-text>
    <mj-text font-size="15px" color="#333" line-height="1.55">Genuine thanks to everyone who jumped on early. You're the reason this is shipping at the pace it is, and the reason we can keep building.</mj-text>
    <mj-text font-size="13px" color="#666" line-height="1.55">If you've been on the fence, OWR Pro is the lever. Ad-free browsing, the full tournament hosting toolkit, and you're directly fuelling the next batch of work.</mj-text>
    <mj-button background-color="#FFD700" color="#1C1C1C" font-weight="700" border-radius="8px" href="${APP_URL}/pricing" padding="12px 0">Become an OWR Pro supporter &rarr;</mj-button>
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
  const mjmlChunks = doc.content.map(renderBlock).filter(Boolean);
  const text = renderText(doc);
  return { mjml: mjmlChunks.join('\n\n'), text };
}

// Header section: small caps "OWR Newsletter, <Month YYYY>", title, preheader, hero image.
// Sits above the rich-text body so the email opens with proper context
// (and the Rails layout can keep its top-of-email logo/banner small).
function renderHeader() {
  const date = new Date(fields.publishedAt);
  const monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const heroUrl = absUrl(fields.heroImagePath);
  const heroBlock = heroUrl
    ? `<mj-section padding="20px 0 24px 0" background-color="#ffffff">
  <mj-column>
    <mj-image src="${escapeHtml(heroUrl)}" alt="${escapeHtml(fields.title)}" border-radius="6px" padding="0" />
  </mj-column>
</mj-section>`
    : '';

  const preheaderBlock = fields.preheader
    ? `<mj-section padding="0 25px 4px 25px" background-color="#ffffff">
  <mj-column>
    <mj-text font-size="16px" color="#666" align="center" line-height="1.5">${escapeHtml(fields.preheader)}</mj-text>
  </mj-column>
</mj-section>`
    : '';

  return `<mj-section padding="20px 25px 0 25px" background-color="#ffffff">
  <mj-column>
    <mj-text align="center" font-size="12px" font-weight="700" letter-spacing="2px" color="#DAA520" text-transform="uppercase">OWR Newsletter, ${escapeHtml(monthYear)}</mj-text>
    <mj-text align="center" font-size="28px" font-weight="bold" color="#1C1C1C" line-height="1.2" padding-top="8px">${escapeHtml(fields.title)}</mj-text>
  </mj-column>
</mj-section>

${preheaderBlock}

${heroBlock}`.trim();
}

function renderHeaderText() {
  const date = new Date(fields.publishedAt);
  const monthYear = date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const lines = [
    `OWR NEWSLETTER, ${monthYear.toUpperCase()}`,
    '',
    fields.title,
  ];
  if (fields.preheader) lines.push('', fields.preheader);
  if (fields.heroImagePath) {
    lines.push('', `[Hero image: ${absUrl(fields.heroImagePath)}]`);
  }
  return lines.join('\n');
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
    case 'heading-2':
      return `## ${node.content.map(inlineText).join('')}`;
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
    if (f.kind === 'sponsor-cards') return '[Sponsors: Mighty Melee Games, UK Resin Prints]';
    if (f.kind === 'cta-host-tournament') return `Host a tournament: ${APP_URL}/host`;
    if (f.kind === 'pro-callout') return `Built by Pro supporters. ${APP_URL}/pricing`;
  }
  return null;
}

// --- Output ---

const { mjml: bodyMjml, text: bodyText } = renderBody(fields.body);
const headerMjml = renderHeader();
const headerText = renderHeaderText();
const mjmlBody = `${headerMjml}\n\n${bodyMjml}`;
const textBody = `${headerText}\n\n${bodyText}`;

const sidecar = {
  slug: fields.slug,
  subject: fields.subject,
  preheader: fields.preheader ?? '',
  category: fields.category,
  region: fields.region ?? null,
  publishedAt: fields.publishedAt,
  webUrl: `${WEB_URL}/newsletter/${fields.slug}`,
};

const outDir = resolve(here, 'out');
await mkdir(outDir, { recursive: true });
await writeFile(resolve(outDir, `${slug}.mjml`), mjmlBody);
await writeFile(resolve(outDir, `${slug}.txt`), textBody);
await writeFile(resolve(outDir, `${slug}.json`), JSON.stringify(sidecar, null, 2));

console.error(`Wrote out/${slug}.mjml (${mjmlBody.length} bytes)`);
console.error(`Wrote out/${slug}.txt  (${textBody.length} bytes)`);
console.error(`Wrote out/${slug}.json`);
console.error('');
console.error('Subject:    ' + sidecar.subject);
console.error('Preheader:  ' + sidecar.preheader);
console.error('Category:   ' + sidecar.category + (sidecar.region ? ` (region: ${sidecar.region})` : ''));
console.error('Web URL:    ' + sidecar.webUrl);

function die(msg) {
  console.error(msg);
  exit(1);
}
