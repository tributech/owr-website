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

// Public endpoints go through Netlify's /api proxy so its CDN can cache them, and
// skip cookies so one cached copy serves every visitor. Only /landing/me needs the session.
const PUBLIC_API_BASE = import.meta.env.PROD ? '' : APP_URL;

export async function publicApiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${PUBLIC_API_BASE}${path}`, {
      credentials: 'omit',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Type definitions ────────────────────────────────────────────────

export interface LandingMe {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  region_flag: string | null;
  region_name: string | null;
  region_slug: string | null;
  player_slug: string | null;
  pro?: boolean;
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
  country_codes?: string[];
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

export interface RankedPlayer {
  id: string;
  name: string;
  url?: string;
  nickname?: string;
  region_code: string;
  rank: number;
  points: number;
  faction_name?: string;
}

export interface FactionRanking {
  faction_id: string;
  faction_name: string;
  players: RankedPlayer[];
}

export interface LandingRankings {
  offline: RankedPlayer[];
  total: RankedPlayer[];
  factions: FactionRanking[];
}

export interface RegionEvent {
  id: string;
  name: string;
  slug: string;
  url: string;
  start_date: string;
  end_date: string | null;
  city: string | null;
  live: boolean;
}

export interface RegionTopPlayer {
  id: string;
  name: string;
  url: string;
  rank: number;
  global_rank: number | null;
  points: string;
}

export interface RegionHome {
  region: Pick<LandingRegion, 'code' | 'slug' | 'name' | 'country_flag' | 'player_count' | 'tournament_count' | 'has_masters'>;
  upcoming_events: RegionEvent[];
  top_players: RegionTopPlayer[];
  top_players_scope: 'season' | 'global';
  top_players_season: { name: string; current: boolean } | null;
}

export interface FeaturedGallery {
  id: string;
  title: string;
  faction_name: string | null;
  image_url: string;
  rating: number | null;
  url: string;
}

export interface FeaturedGalleries {
  galleries: FeaturedGallery[];
}

export function appUrl(path: string): string {
  return /^https?:/.test(path) ? path : `${APP_URL}${path}`;
}
