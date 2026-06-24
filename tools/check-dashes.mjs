#!/usr/bin/env node
/**
 * Hard guard for the no-em-dash / no-en-dash rule (see CLAUDE.md).
 *
 * Scans src/ for em-dashes (U+2014) and en-dashes (U+2013) and fails the build
 * if any are found. These must never appear in user-facing text, and to keep
 * the check simple and unbypassable we forbid them everywhere in src/ (a
 * regular hyphen "-" reads fine in comments too).
 *
 * Runs automatically before `pnpm build`. Run directly with `node tools/check-dashes.mjs`.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(ROOT, 'src');
const EXTS = ['.astro', '.ts', '.tsx', '.jsx', '.js', '.md', '.mdx', '.css'];
const DASH = /[—–]/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXTS.some((e) => name.endsWith(e))) out.push(full);
  }
  return out;
}

const offenders = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (DASH.test(line)) {
      offenders.push(`${relative(ROOT, file)}:${i + 1}: ${line.trim()}`);
    }
  });
}

if (offenders.length) {
  console.error(
    `\n✖ Em-dash / en-dash check failed (${offenders.length} occurrence${offenders.length === 1 ? '' : 's'}).\n` +
      `  Replace every — / – with a spaced hyphen " - ", a comma, a colon, or parentheses.\n` +
      `  This rule is unbreakable (see CLAUDE.md).\n`
  );
  for (const o of offenders) console.error('  ' + o);
  console.error('');
  process.exit(1);
}

console.log('✓ No em-dashes or en-dashes in src/.');
