import type { Entry, EntryFieldTypes } from 'contentful';

// ── docCategory ─────────────────────────────────────────────────────
export interface DocCategorySkeleton {
  contentTypeId: 'docCategory';
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    description?: EntryFieldTypes.Text;
    icon?: EntryFieldTypes.Symbol;
    order: EntryFieldTypes.Integer;
  };
}

export type DocCategoryEntry = Entry<DocCategorySkeleton, undefined, string>;

// ── docArticle ──────────────────────────────────────────────────────
export interface DocArticleSkeleton {
  contentTypeId: 'docArticle';
  fields: {
    title: EntryFieldTypes.Symbol;
    slug: EntryFieldTypes.Symbol;
    category: EntryFieldTypes.EntryLink<DocCategorySkeleton>;
    tags?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;
    excerpt?: EntryFieldTypes.Symbol;
    body: EntryFieldTypes.RichText;
    order: EntryFieldTypes.Integer;
    relatedArticles?: EntryFieldTypes.Array<
      EntryFieldTypes.EntryLink<DocArticleSkeleton>
    >;
  };
}

export type DocArticleEntry = Entry<DocArticleSkeleton, undefined, string>;

// ── changelogEntry ──────────────────────────────────────────────────
export interface ChangelogEntrySkeleton {
  contentTypeId: 'changelogEntry';
  fields: {
    title: EntryFieldTypes.Symbol;
    date: EntryFieldTypes.Date;
    category: EntryFieldTypes.Symbol;
    description: EntryFieldTypes.RichText;
  };
}

export type ChangelogEntryEntry = Entry<
  ChangelogEntrySkeleton,
  undefined,
  string
>;
