// Shared API client for the OWR Rails backend.
// All fetches use full URLs with credentials so cookies work cross-origin.

export const APP_URL =
  import.meta.env.PUBLIC_APP_URL || 'https://oldworldrankings.com';

/**
 * Fetch from the Rails API. Returns parsed JSON on success, `null` on any error.
 * Always sends the session cookie so authenticated endpoints work transparently.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T | null> {
  try {
    const res = await fetch(`${APP_URL}${path}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
      ...options,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Type definitions ────────────────────────────────────────────────

export interface LandingMe {
  full_name: string;
  email: string;
  avatar_url: string | null;
  region_flag: string | null;
  region_name: string | null;
  region_slug: string | null;
  player_slug: string | null;
}

export interface LandingStats {
  player_count: number;
  tournament_count: number;
  army_list_count: number;
  region_count: number;
}

export interface LandingRegion {
  name: string;
  code: string;
  slug: string;
  country_flag: string | null;
  player_count: number;
  tournament_count: number;
  current_season: string | null;
  has_masters?: boolean;
}

export interface LandingRegionsResponse {
  regions: LandingRegion[];
}

export interface SearchPlayer {
  id: number;
  name: string;
  nickname: string | null;
  region: string | null;
  url: string;
}

export interface SearchTournament {
  id: number;
  name: string;
  date: string;
  region: string | null;
  url: string;
}

export interface SearchResults {
  players: SearchPlayer[];
  tournaments: SearchTournament[];
}
