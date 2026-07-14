#!/usr/bin/env node
// Keyword research via Google Ads KeywordPlanIdeaService (generateKeywordIdeas).
// This is the Keyword Planner API the google-ads-mcp doesn't expose.
//
// Auth: gcloud application default credentials (same as google-ads-mcp)
//       + GOOGLE_ADS_DEVELOPER_TOKEN env var.
//
// Usage:
//   node scripts/keyword-ideas.mjs "seed keyword" ["another seed" ...]
//   node scripts/keyword-ideas.mjs --url https://www.oldworldrankings.com "warhammer rankings"
//   node scripts/keyword-ideas.mjs --geo AU --limit 50 "old world tournament"
//
// Flags:
//   --url <url>     also seed from a page URL
//   --geo <cc>      2-letter country (AU, US, GB, ...) default: no geo filter (worldwide)
//   --limit <n>     max rows to print (default 40)
//   --json          raw JSON output instead of table

import { execFileSync } from 'node:child_process';

const API_VERSION = 'v21';
const CUSTOMER_ID = '1277201807'; // Active AdWords Account (non-manager, directly accessible)

// Criterion IDs: https://developers.google.com/google-ads/api/reference/data/geotargets
const GEO = { AU: '2036', US: '2840', GB: '2826', NZ: '2554', CA: '2124', DE: '2276', FR: '2250' };
const LANG_EN = 'languageConstants/1000';

function parseArgs(argv) {
  const opts = { seeds: [], url: null, geo: null, limit: 40, json: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') opts.url = argv[++i];
    else if (a === '--geo') opts.geo = argv[++i]?.toUpperCase();
    else if (a === '--limit') opts.limit = parseInt(argv[++i], 10);
    else if (a === '--json') opts.json = true;
    else opts.seeds.push(a);
  }
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
if (!opts.seeds.length && !opts.url) {
  console.error('Usage: node scripts/keyword-ideas.mjs [--url <url>] [--geo AU] [--limit 40] "seed keyword" ...');
  process.exit(1);
}
if (opts.geo && !GEO[opts.geo]) {
  console.error(`Unknown geo "${opts.geo}". Known: ${Object.keys(GEO).join(', ')}`);
  process.exit(1);
}

const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
if (!devToken) {
  console.error('GOOGLE_ADS_DEVELOPER_TOKEN is not set.');
  process.exit(1);
}

const accessToken = execFileSync('gcloud', ['auth', 'application-default', 'print-access-token'], {
  encoding: 'utf8',
}).trim();

const body = {
  language: LANG_EN,
  keywordPlanNetwork: 'GOOGLE_SEARCH',
  includeAdultKeywords: false,
};
if (opts.geo) body.geoTargetConstants = [`geoTargetConstants/${GEO[opts.geo]}`];
if (opts.url && opts.seeds.length) body.keywordAndUrlSeed = { url: opts.url, keywords: opts.seeds };
else if (opts.url) body.urlSeed = { url: opts.url };
else body.keywordSeed = { keywords: opts.seeds };

const res = await fetch(
  `https://googleads.googleapis.com/${API_VERSION}/customers/${CUSTOMER_ID}:generateKeywordIdeas`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': devToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  },
);

if (!res.ok) {
  const err = await res.text();
  console.error(`API error ${res.status}:\n${err}`);
  process.exit(1);
}

const data = await res.json();
const results = (data.results ?? [])
  .map((r) => ({
    keyword: r.text,
    monthlySearches: Number(r.keywordIdeaMetrics?.avgMonthlySearches ?? 0),
    competition: r.keywordIdeaMetrics?.competition ?? 'UNKNOWN',
    lowBid: r.keywordIdeaMetrics?.lowTopOfPageBidMicros
      ? (Number(r.keywordIdeaMetrics.lowTopOfPageBidMicros) / 1e6).toFixed(2)
      : '',
    highBid: r.keywordIdeaMetrics?.highTopOfPageBidMicros
      ? (Number(r.keywordIdeaMetrics.highTopOfPageBidMicros) / 1e6).toFixed(2)
      : '',
  }))
  .sort((a, b) => b.monthlySearches - a.monthlySearches)
  .slice(0, opts.limit);

if (opts.json) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const w = Math.max(12, ...results.map((r) => r.keyword.length)) + 2;
  console.log(
    `${'KEYWORD'.padEnd(w)}${'SEARCHES/MO'.padStart(12)}  ${'COMPETITION'.padEnd(12)}${'BID LOW-HIGH'.padStart(14)}`,
  );
  for (const r of results) {
    const bids = r.lowBid ? `$${r.lowBid}-$${r.highBid}` : '';
    console.log(
      `${r.keyword.padEnd(w)}${String(r.monthlySearches).padStart(12)}  ${r.competition.padEnd(12)}${bids.padStart(14)}`,
    );
  }
  console.log(`\n${results.length} of ${data.results?.length ?? 0} ideas${opts.geo ? ` (geo: ${opts.geo})` : ' (worldwide)'}`);
}
