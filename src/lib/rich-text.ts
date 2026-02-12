import {
  documentToHtmlString,
  type Options,
} from '@contentful/rich-text-html-renderer';
import { BLOCKS, MARKS, INLINES, type Document } from '@contentful/rich-text-types';
import type { Entry } from 'contentful';

// Callout detection: blockquotes starting with emoji prefixes
const CALLOUT_PREFIXES: Record<string, { type: string; icon: string; borderColor: string; bgColor: string; iconBg: string }> = {
  '💡 Tip:': { type: 'tip', icon: '💡', borderColor: 'border-emerald-400', bgColor: 'bg-emerald-50', iconBg: 'bg-emerald-100' },
  '⚠️ Warning:': { type: 'warning', icon: '⚠️', borderColor: 'border-amber-400', bgColor: 'bg-amber-50', iconBg: 'bg-amber-100' },
  '❗ Important:': { type: 'important', icon: '❗', borderColor: 'border-red-400', bgColor: 'bg-red-50', iconBg: 'bg-red-100' },
  '📝 Note:': { type: 'note', icon: '📝', borderColor: 'border-blue-400', bgColor: 'bg-blue-50', iconBg: 'bg-blue-100' },
};

function extractCalloutPrefix(node: any): { prefix: string; config: typeof CALLOUT_PREFIXES[string] } | null {
  // Walk the first paragraph's first text node to check for emoji prefix
  const firstChild = node.content?.[0];
  if (!firstChild || firstChild.nodeType !== 'paragraph') return null;

  const firstText = firstChild.content?.[0];
  if (!firstText || firstText.nodeType !== 'text') return null;

  const text = firstText.value as string;
  for (const [prefix, config] of Object.entries(CALLOUT_PREFIXES)) {
    if (text.startsWith(prefix)) {
      return { prefix, config };
    }
  }
  return null;
}

function stripCalloutPrefix(node: any, prefix: string): any {
  // Deep clone the node and strip the prefix from the first text node
  const cloned = JSON.parse(JSON.stringify(node));
  const firstText = cloned.content[0].content[0];
  firstText.value = firstText.value.slice(prefix.length).trimStart();
  // If the text node is now empty, remove it
  if (!firstText.value) {
    cloned.content[0].content.shift();
  }
  return cloned;
}

const options: Options = {
  renderMark: {
    [MARKS.CODE]: (text) =>
      `<code class="inline-code">${text}</code>`,
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (_node, next) =>
      `<h2 class="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">${next(_node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (_node, next) =>
      `<h3 class="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3">${next(_node.content)}</h3>`,
    [BLOCKS.HEADING_4]: (_node, next) =>
      `<h4 class="text-base font-semibold text-gray-900 dark:text-white mt-4 mb-2">${next(_node.content)}</h4>`,
    [BLOCKS.PARAGRAPH]: (_node, next) =>
      `<p class="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">${next(_node.content)}</p>`,
    [BLOCKS.UL_LIST]: (_node, next) =>
      `<ul class="list-disc pl-6 mb-4 space-y-1 text-gray-600 dark:text-gray-400">${next(_node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (_node, next) =>
      `<ol class="list-decimal pl-6 mb-4 space-y-2 text-gray-600 dark:text-gray-400 marker:font-semibold marker:text-gray-900 dark:marker:text-white">${next(_node.content)}</ol>`,
    [BLOCKS.LIST_ITEM]: (_node, next) =>
      `<li>${next(_node.content)}</li>`,
    [BLOCKS.QUOTE]: (node, next) => {
      const callout = extractCalloutPrefix(node);
      if (callout) {
        const stripped = stripCalloutPrefix(node, callout.prefix);
        const innerHtml = next(stripped.content);
        return `<div class="callout callout-${callout.config.type} border-l-4 ${callout.config.borderColor} ${callout.config.bgColor} rounded-r-lg my-4 p-4 flex gap-3"><span class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${callout.config.iconBg} text-sm">${callout.config.icon}</span><div class="callout-content flex-1 min-w-0">${innerHtml}</div></div>`;
      }
      return `<blockquote class="border-l-4 border-owr-gold pl-4 py-2 my-4 text-gray-600 dark:text-gray-400 italic">${next(node.content)}</blockquote>`;
    },
    [BLOCKS.HR]: () => `<hr class="my-8 border-gray-200 dark:border-gray-700" />`,
    [BLOCKS.TABLE]: (_node, next) =>
      `<div class="overflow-x-auto my-6 rounded-lg border border-gray-200 dark:border-gray-700"><table class="min-w-full text-sm">${next(_node.content)}</table></div>`,
    [BLOCKS.TABLE_ROW]: (_node, next) =>
      `<tr class="border-b border-gray-100 even:bg-gray-50 hover:bg-gray-100/50 dark:border-gray-700 dark:even:bg-gray-800 dark:hover:bg-gray-800/50 transition-colors">${next(_node.content)}</tr>`,
    [BLOCKS.TABLE_CELL]: (_node, next) =>
      `<td class="px-4 py-2.5 text-gray-600 dark:text-gray-400 [&>p]:mb-0">${next(_node.content)}</td>`,
    [BLOCKS.TABLE_HEADER_CELL]: (_node, next) =>
      `<th class="px-4 py-2.5 text-left font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 [&>p]:mb-0">${next(_node.content)}</th>`,
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const asset = node.data.target as Entry;
      const fields = asset.fields as Record<string, any>;
      const url = fields?.file?.url;
      const title = fields?.title || '';
      const description = fields?.description || '';
      if (!url) return '';
      return `<figure class="my-6"><img src="https:${url}" alt="${title}" loading="lazy" class="rounded-lg w-full" />${description ? `<figcaption class="text-sm text-gray-500 mt-2 text-center">${description}</figcaption>` : ''}</figure>`;
    },
    [INLINES.HYPERLINK]: (node, next) =>
      `<a href="${node.data.uri}" class="text-gray-900 dark:text-owr-gold underline underline-offset-4 hover:text-owr-gold-dark transition-colors"${node.data.uri.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${next(node.content)}</a>`,
  },
};

export function renderRichText(document: Document): string {
  return documentToHtmlString(document, options);
}
