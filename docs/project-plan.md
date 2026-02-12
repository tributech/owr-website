# OWR Marketing Site — Project Plan

## Context

The marketing site (`www.oldworldrankings.com`) shares a session cookie with the Rails app (`oldworldrankings.com`) via the `.oldworldrankings.com` cookie domain. This means:

- The site can detect logged-in users and personalise the nav (avatar, region flag, "Go to Dashboard" vs "Login")
- All API calls use `credentials: 'include'` — the httpOnly session cookie is sent automatically
- The existing Grape API (`/api/v1/`) already supports session-based auth via warden fallback (no JWT needed from the browser)
- CORS is configured on the Rails side to allow `www` origins with credentials

## Phase 1: API Client + Nav Personalisation

### 1.1 Create API client utility

Create a reusable fetch wrapper for calling the Rails API from client-side JS.

**File:** `src/lib/api.ts`

```ts
const API_URL = import.meta.env.PUBLIC_APP_URL || 'https://oldworldrankings.com';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' },
      ...options,
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
```

### 1.2 Build lightweight `/api/v1/landing/me` endpoint (Rails side)

The existing `/api/v1/me` returns everything (identities, feature flags, email prefs). The marketing site only needs minimal data for nav state.

**New Grape endpoint in Rails repo:**

```
GET /api/v1/landing/me
```

**Response (authenticated):**
```json
{
  "logged_in": true,
  "name": "Colin",
  "avatar_url": "https://...",
  "region": { "code": "AU", "name": "Australia", "slug": "australia" },
  "dashboard_url": "/my_events"
}
```

**Response (anonymous):** `401 Unauthorized`

This is a new Grape resource mounted under `Owr::V1::Base`. It should use the existing `AuthHelper` and call `current_user` (which falls back to warden session).

### 1.3 Personalise Nav.astro

Update the nav component to show logged-in state:

- **Anonymous:** "Login" and "Register" buttons linking to the Rails app
- **Logged in:** Avatar, region flag, "Dashboard" link, user dropdown

Implementation:
- Render anonymous state in HTML (SSG)
- On page load, call `/api/v1/landing/me` from a `<script>` tag
- If authenticated, swap in the personalised nav elements
- Use progressive enhancement — page works without JS and without being logged in

## Phase 2: Landing Page Data Endpoints

### 2.1 Platform stats endpoint (Rails side)

```
GET /api/v1/landing/stats
```

**Public, cacheable (Cache-Control: 5 minutes)**

```json
{
  "player_count": 12450,
  "tournament_count": 387,
  "army_list_count": 8920,
  "region_count": 14,
  "active_tournament_count": 12
}
```

Should be a simple query object in Rails — aggregate counts from the database, cached at the endpoint level.

### 2.2 Regions endpoint (Rails side)

```
GET /api/v1/landing/regions
```

**Public, cacheable (Cache-Control: 10 minutes)**

```json
{
  "regions": [
    {
      "name": "Australia",
      "code": "AU",
      "slug": "australia",
      "flag_url": "...",
      "player_count": 1200,
      "tournament_count": 45,
      "current_season": "Season 2"
    }
  ]
}
```

### 2.3 Wire StatsBar and RegionsSection components

Update these existing Astro components to fetch from the new endpoints client-side:

- `StatsBar.astro` — fetch `/api/v1/landing/stats`, populate counters with animated count-up
- `RegionsSection.astro` — fetch `/api/v1/landing/regions`, render region cards with flags and counts

Both should render placeholder/skeleton state in SSG HTML, then hydrate with real data.

## Phase 3: Search

### 3.1 Search endpoint (Rails side)

```
GET /api/v1/search?q=<query>
```

**Public, short cache (Cache-Control: 1 minute)**

```json
{
  "players": [
    { "id": "...", "name": "Colin", "nickname": "colinbm", "region": "AU", "url": "/players/..." }
  ],
  "tournaments": [
    { "id": "...", "name": "Cancon 2026", "date": "2026-01-25", "region": "AU", "url": "/au/tournaments/..." }
  ]
}
```

Limit results to ~5 per category. Should use existing search scopes on Player and Tournament models.

### 3.2 Wire HeroSection search

The hero section already has a search input. Connect it to the search endpoint:

- Debounce input (300ms)
- Show dropdown with player and tournament results
- Each result links to the Rails app (full URL since it's on the apex domain)
- Handle empty state and loading state

## Phase 4: Live Tournament Data (Future)

### 4.1 Live/upcoming tournaments endpoint (Rails side)

```
GET /api/v1/landing/live
```

**Public, cacheable (Cache-Control: 2 minutes)**

```json
{
  "live": [
    { "name": "Cancon 2026", "region": "AU", "round": 3, "total_rounds": 5, "player_count": 64, "url": "..." }
  ],
  "upcoming": [
    { "name": "LVO 2026", "region": "US", "date": "2026-02-14", "player_count": 128, "url": "..." }
  ]
}
```

### 4.2 Live tournament ticker component

Show a ticker/banner of live tournaments on the landing page. Links through to the Rails app battleboard/live views.

## Phase 5: Additional Content

### 5.1 Faction popularity / meta stats (Rails side)

```
GET /api/v1/landing/factions
```

Top factions by play rate, win rate — for a "meta snapshot" section on the landing page.

### 5.2 Top players by region

```
GET /api/v1/landing/top-players?region=<code>
```

Leaderboard preview for each region.

## Implementation Notes

### All new Rails endpoints should:
- Live under `app/api/owr/v1/landing.rb` (new Grape resource)
- Be mounted in `Owr::V1::Base`
- Use query objects for data fetching (not inline queries)
- Public endpoints: no `authenticate!` before filter
- Authenticated endpoints: use `current_user` (returns nil for anonymous)
- Include `Cache-Control` headers on public endpoints
- Be unit tested via request specs

### All Astro components should:
- Render meaningful placeholder/skeleton HTML at build time (SSG)
- Hydrate with API data client-side via `<script>` tags
- Gracefully handle API failures (show static content, hide dynamic sections)
- Use progressive enhancement — the page must be useful without JS

### Netlify proxy config (netlify.toml)
Ensure API calls from the browser are proxied to avoid CORS in production:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://oldworldrankings.com/api/:splat"
  status = 200
  force = true
```

This means in production, fetch calls can use relative paths (`/api/v1/landing/stats`) and Netlify proxies them. The `credentials: 'include'` still works because the browser sees same-origin.

**However**, for endpoints that need the session cookie, the Netlify proxy won't forward cookies to the Rails backend (different origin server-side). For authenticated endpoints like `/api/v1/landing/me`, fetch directly from `PUBLIC_APP_URL` with `credentials: 'include'` so the browser sends the cookie cross-origin (CORS handles it).

### Priority order
1. **Phase 1** — Nav personalisation (biggest UX win, proves the cookie architecture works)
2. **Phase 2** — Stats + regions (makes the landing page feel alive)
3. **Phase 3** — Search (key interactive feature)
4. **Phase 4+** — Live data, meta stats (nice-to-have, build when content is ready)
