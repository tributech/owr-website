# OWR Website — Old World Rankings Marketing & Content Site

## What This Is

Static marketing website for [Old World Rankings](https://www.oldworldrankings.com) — the companion platform for Warhammer: The Old World. This site serves the canonical `www.` subdomain and handles the landing page, pricing, legal pages, and (future) blog content.

The main **Rails app** (`oldworldrankings` repo) serves the authenticated app experience at `oldworldrankings.com`. This Astro site is the public-facing marketing site only.

## Tech Stack

- **Framework:** Astro 5 (static site generation)
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` plugin, NOT the old Astro integration)
- **Package Manager:** pnpm
- **Hosting:** Netlify (static, published from `dist/`)
- **Node:** v20
- **Future CMS:** Contentful (for blog/content pages)

## Project Structure

```
src/
├── components/          # Astro components (.astro files)
│   ├── Nav.astro        # Fixed header with mobile menu + user personalisation
│   ├── Footer.astro     # Site footer
│   ├── HeroSection.astro        # Hero with rotating backgrounds + search
│   ├── StatsBar.astro           # Live platform stats (API-driven)
│   ├── RegionsSection.astro     # Region grid (API-driven)
│   ├── FeaturesSection.astro    # Feature cards grid
│   ├── TournamentHostingSection.astro  # TO benefits
│   ├── PricingSection.astro     # Free/Pro comparison
│   └── MobileAppSection.astro   # Mobile app promo
├── lib/
│   └── api.ts           # Shared API client + TypeScript types
├── layouts/
│   └── Layout.astro     # Base HTML layout (meta, fonts, GA)
├── pages/
│   ├── index.astro      # Landing page (all sections)
│   ├── pricing.astro    # Full pricing page
│   ├── privacy.astro    # Privacy policy
│   ├── terms.astro      # Terms of service
│   └── 404.astro        # Not found page
└── styles/
    └── global.css       # Tailwind imports + OWR theme (@theme block)
```

## Commands

```bash
pnpm dev       # Astro dev server on localhost:5091 (internal)
pnpm build     # Production build to dist/
pnpm preview   # Preview production build locally
```

Caddy terminates HTTPS — access the site at `https://www.owr-local.site:5090`.
Caddy config lives in the **Rails repo** (`oldworldrankings/Caddyfile`) and is started via the Rails Procfile.dev.

## Architecture & Key Decisions

### Domain Strategy
- `www.oldworldrankings.com` → This Astro site (Netlify)
- `oldworldrankings.com` → Rails app (apex domain)
- The Rails app 301 redirects `www` paths (`/`, `/pricing`, `/privacy`, `/terms`) to this site
- This site links back to the Rails app for authenticated features (login, register, dashboards)

### Cross-Domain Session Cookie

The Rails session cookie (`_owr_session`) is scoped to `.oldworldrankings.com` (production) / `.owr-local.site` (development), making it available to both the apex Rails app and this `www` subdomain.

This means:
- **This site can detect logged-in users** by calling the Rails API with `credentials: 'include'`
- **The cookie is httpOnly** — JavaScript cannot read it directly, but it is sent automatically with fetch requests to the Rails API
- **No JWT needed** — the existing Grape API (`/api/v1/`) already falls back to Devise session auth via warden when no Bearer token is present

**How to use it from client-side JS:**
```ts
// All components use the shared client in src/lib/api.ts
import { apiFetch, APP_URL, type LandingMe } from '../lib/api';

// Cookie is sent automatically — if user is logged in, this returns their profile
const user = await apiFetch<LandingMe>('/api/v1/landing/me');
if (user) {
  // user.full_name, user.region_flag, user.region_slug, etc.
}
// null = 401 (not logged in) or network error — render anonymous state
```

**CORS is configured** on the Rails side to allow `https://www.oldworldrankings.com` (prod) and `https://www.owr-local.site:5090` (dev) with `credentials: true`.

### API Integration

Dynamic data (stats, regions, search, user state) is fetched **client-side** from the Rails Grape API via the shared client in `src/lib/api.ts`.

All API calls use `apiFetch<T>(path)` which prepends `APP_URL`, sets `credentials: 'include'` + `Accept: application/json`, and returns `T | null` (catches all errors gracefully).

In development, fetches go directly to `https://owr-local.site:5100/api/v1/...`. In production, consider Netlify proxy redirects:
```
/api/* → https://oldworldrankings.com/api/:splat
```

**Active Rails API endpoints (Grape, `/api/v1/`):**
- `GET /api/v1/landing/stats` — player_count, tournament_count, army_list_count, region_count (public, cached)
- `GET /api/v1/landing/regions` — region list with slug, country_flag, player_count, has_masters (public, cached). Response wrapped in `{ regions: [...] }`
- `GET /api/v1/landing/me` — full_name, avatar_url, region_flag, region_name, region_slug (authenticated, 401 if anonymous)
- `GET /api/v1/search?q=...` — global search returning `{ players: [...], tournaments: [...] }` (public)

**Pending additions to `/api/v1/landing/me`:**
- `email` — user's email (shown under name in nav dropdown)
- `player_slug` — for "My Player Profile" link (to construct `/players/:slug` URL)

Public endpoints should include `Cache-Control` headers.

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PUBLIC_APP_URL` | Rails app URL (default: `https://oldworldrankings.com`) | No |
| `PUBLIC_GA_ID` | Google Analytics ID | No |

Prefix with `PUBLIC_` for client-side access in Astro. Configure in Netlify dashboard for production.

### Local Development Setup

Both apps run behind Caddy for HTTPS so cookies and OAuth work across subdomains.

| Service | External URL (HTTPS) | Internal port |
|---------|---------------------|---------------|
| Rails app | `https://owr-local.site:5100` | `localhost:5101` |
| Astro (this site) | `https://www.owr-local.site:5090` | `localhost:5091` |
| Cookie domain | `.owr-local.site` | — |

DNS is managed in Namecheap — `@` and `www` A records point to `127.0.0.1`.
Caddy and Rails processes are started from the **Rails repo** via `Procfile.dev`. Start Astro separately with `pnpm dev` in this repo.

## Theme & Design System

### Colors (defined in `src/styles/global.css` via `@theme`)

| Token | Hex | Usage |
|-------|-----|-------|
| `owr-gold` | #FFD700 | Primary accent, badges, CTAs |
| `owr-gold-dark` | #DAA520 | Gold hover states |
| `owr-red` | #800000 | Sidebar accent (app) |
| `owr-black` | #1C1C1C | Deep backgrounds |
| `owr-silver` | #C0C0C0 | Secondary accent |
| `owr-bronze` | #B87333 | Tertiary accent |

Usage: `bg-owr-gold`, `text-owr-gold-dark`, `border-owr-red`, etc.

### Typography
- **Primary font:** Montserrat (400, 500, 600, 700, 800) — loaded via Google Fonts
- Access via `font-sans` (set in @theme)

### Design Patterns
- **Sections:** Alternate light/dark backgrounds for visual rhythm
- **Light sections:** `bg-white` or `bg-gray-50`
- **Dark sections:** `bg-gray-900` with pattern overlays
- **Section spacing:** `py-16 sm:py-24`
- **Content containers:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Cards:** `rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-400`
- **Buttons:** Primary = `bg-gray-900 text-white`, Gold CTA = `bg-owr-gold text-gray-900 font-semibold hover:bg-owr-gold-dark`, Secondary = `border border-gray-300`
- **Badges:** `rounded-full bg-owr-gold text-gray-900 text-xs font-semibold`
- **Fixed nav:** `backdrop-blur-md` with transparent option for hero overlay

### Assets
- Logo: `/public/images/owr_logo_white.png` (white logo, invert for light backgrounds)
- SVG logo: `/public/images/owr-logo-white.svg`
- Hero backgrounds: `/public/images/landing/image1.jpg` through `image16.jpg`

## Conventions

### Component Patterns
- All components are `.astro` files (no React/Vue — keep it static)
- Use TypeScript interfaces for props in component frontmatter
- Client-side interactivity via module `<script>` tags importing from `../lib/api`
- API data fetched client-side (progressive enhancement — page works without API)
- Use `class:list` for conditional classes

### Nav Personalisation
The nav renders an **anonymous state** by default (Sign In / Get Started). When JS runs, it calls `/api/v1/landing/me` — if authenticated, it swaps to:
- **Desktop:** Dark "Dashboard" pill button (with region flag) + avatar with gold ring + dropdown menu
- **Mobile:** Dashboard, Profile, Settings, Log out links in the hamburger menu
- **Dropdown:** Dark theme (`bg-owr-black`, `border-owr-gold/30`, gold text) matching the Rails app's user menu — includes My Player Profile, My Events, Profile Settings, What's new on OWR?, Log out
- If the API returns 401 or fails, the anonymous state stays (no visible change)

### Styling
- Tailwind utility-first, custom colors via `@theme` directive (Tailwind 4 pattern)
- NO separate tailwind.config.js — everything in global.css
- Icons: Inline SVG paths (no icon library dependency)
- Responsive: `sm:` (640px), `md:` (768px), `lg:` (1024px)

### Links
- Internal navigation: relative paths (`/pricing`, `/#features`)
- App links: Use `APP_URL` variable (`${APP_URL}/login`, `${APP_URL}/register`)
- External links: `target="_blank" rel="noopener noreferrer"`
- Scroll targets: `id="section-name"` + `scroll-mt-20` class

## Future Work

### Contentful Blog Integration
- Will use Astro content collections or Contentful SDK
- Blog at `/blog/` with individual post pages
- SEO-optimized with structured data

### Additional Pages Planned
- `/about` — Team/project story
- `/blog` — Content marketing (Contentful)
- `/changelog` — Platform updates
- `/contact` — Contact form

### Rails API Enhancements
See `docs/project-plan.md` for the full implementation plan. Remaining work:
1. Add `email` and `player_slug` fields to `GET /api/v1/landing/me` response
2. Consider: `GET /api/v1/landing/live` — live/upcoming tournaments for hero section

### SEO & Performance
- Canonical URLs via `<link rel="canonical">` in Layout
- Static HTML = fast TTFB from Netlify CDN
- Images lazy-loaded except hero first slide
- Consider: sitemap.xml generation, structured data, OG images
