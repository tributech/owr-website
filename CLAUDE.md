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
│   ├── Nav.astro        # Fixed header navigation
│   ├── Footer.astro     # Site footer
│   ├── HeroSection.astro        # Hero with rotating battle backgrounds + search
│   ├── StatsBar.astro           # Live platform stats (API-driven)
│   ├── RegionsSection.astro     # Region grid (API-driven)
│   ├── FeaturesSection.astro    # Feature cards grid
│   ├── TournamentHostingSection.astro  # TO benefits
│   ├── PricingSection.astro     # Free/Pro comparison
│   └── MobileAppSection.astro   # Mobile app promo
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
pnpm dev       # Dev server at localhost:4321
pnpm build     # Production build to dist/
pnpm preview   # Preview production build locally
```

## Architecture & Key Decisions

### Domain Strategy
- `www.oldworldrankings.com` → This Astro site (Netlify)
- `oldworldrankings.com` → Rails app (apex domain)
- The Rails app 301 redirects `www` paths (`/`, `/pricing`, `/privacy`, `/terms`) to this site
- This site links back to the Rails app for authenticated features (login, register, dashboards)

### API Integration
Dynamic data (stats, regions, search) is fetched **client-side** from the Rails API, proxied through Netlify redirects:

```
/api/* → https://oldworldrankings.com/api/:splat
```

**API endpoints needed on the Rails side:**
- `GET /api/landing/stats` — player_count, tournament_count, army_list_count, region_count
- `GET /api/landing/regions` — region list with player_count, total_tournaments, slug, country_flag
- `GET /api/search?q=...` — global search (players + tournaments), returns `{ players: [...], tournaments: [...] }`

These should be public, cacheable endpoints. Consider adding Cache-Control headers.

### Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `PUBLIC_APP_URL` | Rails app URL (default: `https://oldworldrankings.com`) | No |
| `PUBLIC_GA_ID` | Google Analytics ID | No |

Prefix with `PUBLIC_` for client-side access in Astro. Configure in Netlify dashboard for production.

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
- **Buttons:** Primary = `bg-gray-900 text-white`, Secondary = `border border-gray-300`
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
- Client-side interactivity via `<script>` tags with `define:vars` for server data
- API data fetched client-side (progressive enhancement — page works without API)
- Use `class:list` for conditional classes

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

### Rails API Endpoints to Build
Priority endpoints for this site to consume:
1. `GET /api/landing/stats` — aggregate platform statistics
2. `GET /api/landing/regions` — region listing with counts
3. `GET /api/search` — global player/tournament search
4. Consider: `GET /api/landing/top-players` — for rankings section
5. Consider: `GET /api/landing/faction-popularity` — for meta section

### SEO & Performance
- Canonical URLs via `<link rel="canonical">` in Layout
- Static HTML = fast TTFB from Netlify CDN
- Images lazy-loaded except hero first slide
- Consider: sitemap.xml generation, structured data, OG images
