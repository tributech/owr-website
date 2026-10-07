import type { LandingRegion } from './api';

const STORAGE_KEY = 'owr-region';
const GEO_COOKIE = 'owr_geo';

export function savedRegionCode(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveRegionCode(code: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, code.toUpperCase());
  } catch {
    // Private mode: the choice just won't persist.
  }
}

export function geoCountryCode(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${GEO_COOKIE}=([A-Z]{2})`));
  return match ? match[1] : null;
}

export function regionForCountry(
  regions: LandingRegion[],
  country: string | null,
): LandingRegion | null {
  if (!country) return null;
  return (
    regions.find((r) => r.country_codes?.includes(country)) ??
    regions.find((r) => r.code === country) ??
    null
  );
}

// Precedence: explicit choice, then the signed-in user's region, then geo.
export function resolveRegion(
  regions: LandingRegion[],
  userRegionSlug: string | null,
): LandingRegion | null {
  const byCode = (code: string | null) =>
    code ? regions.find((r) => r.code === code.toUpperCase()) ?? null : null;
  const bySlug = (slug: string | null) =>
    slug ? regions.find((r) => r.slug === slug) ?? null : null;

  return (
    byCode(savedRegionCode()) ??
    bySlug(userRegionSlug) ??
    regionForCountry(regions, geoCountryCode())
  );
}
