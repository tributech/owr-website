/**
 * Convert a 2-letter country/region code to a flag emoji.
 * Handles the UK→GB alias and the ZZ (Online/Global) special case.
 */
export function countryFlag(code: string | null): string {
  if (!code) return '';
  if (code === 'ZZ') return '🌎';
  const mapped = code === 'UK' ? 'GB' : code;
  return String.fromCodePoint(
    ...mapped
      .toUpperCase()
      .split('')
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}
