import {
  documentToHtmlString,
  type Options,
} from '@contentful/rich-text-html-renderer';
import { BLOCKS, INLINES, type Document } from '@contentful/rich-text-types';
import type { Entry } from 'contentful';

const options: Options = {
  renderNode: {
    [BLOCKS.HEADING_2]: (_node, next) =>
      `<h2 class="text-xl font-semibold text-gray-900 mt-8 mb-4">${next(_node.content)}</h2>`,
    [BLOCKS.HEADING_3]: (_node, next) =>
      `<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3">${next(_node.content)}</h3>`,
    [BLOCKS.HEADING_4]: (_node, next) =>
      `<h4 class="text-base font-semibold text-gray-900 mt-4 mb-2">${next(_node.content)}</h4>`,
    [BLOCKS.PARAGRAPH]: (_node, next) =>
      `<p class="text-gray-600 leading-relaxed mb-4">${next(_node.content)}</p>`,
    [BLOCKS.UL_LIST]: (_node, next) =>
      `<ul class="list-disc pl-6 mb-4 space-y-1 text-gray-600">${next(_node.content)}</ul>`,
    [BLOCKS.OL_LIST]: (_node, next) =>
      `<ol class="list-decimal pl-6 mb-4 space-y-1 text-gray-600">${next(_node.content)}</ol>`,
    [BLOCKS.LIST_ITEM]: (_node, next) =>
      `<li>${next(_node.content)}</li>`,
    [BLOCKS.QUOTE]: (_node, next) =>
      `<blockquote class="border-l-4 border-owr-gold pl-4 py-2 my-4 text-gray-600 italic">${next(_node.content)}</blockquote>`,
    [BLOCKS.HR]: () => `<hr class="my-8 border-gray-200" />`,
    [BLOCKS.TABLE]: (_node, next) =>
      `<div class="overflow-x-auto my-6"><table class="min-w-full border border-gray-200 rounded-lg text-sm">${next(_node.content)}</table></div>`,
    [BLOCKS.TABLE_ROW]: (_node, next) =>
      `<tr class="border-b border-gray-200">${next(_node.content)}</tr>`,
    [BLOCKS.TABLE_CELL]: (_node, next) =>
      `<td class="px-4 py-2 text-gray-600">${next(_node.content)}</td>`,
    [BLOCKS.TABLE_HEADER_CELL]: (_node, next) =>
      `<th class="px-4 py-2 text-left font-semibold text-gray-900 bg-gray-50">${next(_node.content)}</th>`,
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
      `<a href="${node.data.uri}" class="text-gray-900 underline underline-offset-4 hover:text-owr-gold-dark transition-colors"${node.data.uri.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : ''}>${next(node.content)}</a>`,
  },
};

export function renderRichText(document: Document): string {
  return documentToHtmlString(document, options);
}
