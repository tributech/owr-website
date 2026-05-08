// Newsletter-specific rich-text renderer.
//
// Distinct from src/lib/rich-text.ts (which is tuned for /docs and /whatsnew
// styling). Newsletter prose has its own typography:
//  - bold mark renders as a strong with the high-contrast prose color
//  - code mark renders as a gold pill badge (used for status callouts like
//    "33 of 30 spots filled")
//  - links use the OWR gold-dark accent
//
// Top-level embedded-entry-blocks are NOT rendered here. The Astro page
// walks the top-level content array itself, dispatches embeds to components,
// and asks this module to render the surrounding rich-text nodes.

import {
  documentToHtmlString,
  type Options,
} from '@contentful/rich-text-html-renderer';
import {
  BLOCKS,
  MARKS,
  INLINES,
  type Document,
  type Node as RtNode,
} from '@contentful/rich-text-types';

const APP_URL = import.meta.env.PUBLIC_APP_URL ?? 'https://oldworldrankings.com';

// Slugify h2 text for stable anchor ids (used by intra-newsletter links like #battle-hub).
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function nodeText(node: any): string {
  if (node.nodeType === 'text') return node.value as string;
  if (Array.isArray(node.content))
    return node.content.map(nodeText).join('');
  return '';
}

const STRONG = 'text-gray-900 dark:text-white font-semibold';
const BADGE =
  'inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-wide rounded-full bg-owr-gold text-gray-900 align-middle mx-1';
const LINK = 'text-owr-gold-dark hover:underline';

const options: Options = {
  renderMark: {
    [MARKS.BOLD]: (text) =>
      `<strong class="${STRONG}">${text}</strong>`,
    [MARKS.ITALIC]: (text) => `<em>${text}</em>`,
    [MARKS.UNDERLINE]: (text) => `<u>${text}</u>`,
    [MARKS.CODE]: (text) =>
      `<span class="${BADGE}">${text}</span>`,
  },
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_n, next) =>
      `<p>${next(_n.content)}</p>`,
    [BLOCKS.HEADING_2]: (_n, next) => {
      const id = slugifyHeading(nodeText(_n));
      return `<h2 id="${id}" class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white !mt-12 !mb-4 scroll-mt-20">${next(_n.content)}</h2>`;
    },
    [BLOCKS.HEADING_3]: (_n, next) =>
      `<h3 class="text-xl font-bold text-gray-900 dark:text-white !mt-10 !mb-3">${next(_n.content)}</h3>`,
    [BLOCKS.UL_LIST]: (_n, next) =>
      `<ul class="list-disc pl-6 space-y-2 my-4">${next(_n.content)}</ul>`,
    [BLOCKS.OL_LIST]: (_n, next) =>
      `<ol class="list-decimal pl-6 space-y-2 my-4">${next(_n.content)}</ol>`,
    [BLOCKS.LIST_ITEM]: (_n, next) =>
      `<li>${next(_n.content)}</li>`,
    [BLOCKS.HR]: () =>
      `<hr class="my-8 border-gray-200 dark:border-gray-800" />`,
    [BLOCKS.QUOTE]: (_n, next) =>
      `<blockquote class="border-l-4 border-owr-gold pl-4 italic text-gray-600 dark:text-gray-400 my-4">${next(_n.content)}</blockquote>`,
    [INLINES.HYPERLINK]: (node, next) => {
      const uri = (node.data as any).uri as string;
      const isExternal =
        /^https?:\/\//.test(uri) && !uri.startsWith(APP_URL);
      const externalAttrs = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';
      return `<a href="${uri}" class="${LINK}"${externalAttrs}>${next(node.content)}</a>`;
    },
  },
};

// Render a single top-level rich-text node as HTML.
export function renderNewsletterNode(node: RtNode): string {
  const doc: Document = {
    nodeType: 'document' as any,
    data: {},
    content: [node as any],
  } as any;
  return documentToHtmlString(doc, options);
}
