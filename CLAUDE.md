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
- **CMS:** Contentful (help docs, changelog, future blog)

## Project Structure

```
src/
├── components/          # Astro components (.astro files)
│   ├── Nav.astro        # Fixed header with mobile menu + user personalisation
│   ├── Footer.astro     # Site footer
│   ├── home/            # Homepage sections (region bar + picker, hero, region panel, top players, armies, hosting)
│   ├── GlobalSearch.tsx # Search island (players + tournaments)
│   └── PricingSection.astro     # Free/Pro comparison (tournament-organisers page)
├── lib/
│   ├── api.ts           # Shared API client + TypeScript types
│   ├── region.ts        # Visitor region: saved choice > signed-in user > owr_geo cookie
│   ├── store-links.ts   # App Store / Google Play URLs (single source)
│   ├── contentful.ts    # Contentful SDK client (returns null if unconfigured)
│   ├── contentful-types.ts  # TypeScript skeletons for Contentful content types
│   └── rich-text.ts     # Rich text → HTML renderer with OWR Tailwind classes
├── layouts/
│   └── Layout.astro     # Base HTML layout (meta, fonts, GA)
├── pages/
│   ├── index.astro      # Landing page (all sections)
│   ├── pricing.astro    # Full pricing page
│   ├── privacy.astro    # Privacy policy
│   ├── terms.astro      # Terms of service
│   ├── 404.astro        # Not found page
│   ├── whatsnew.astro   # Changelog feed (Contentful changelogEntry)
│   └── docs/
│       ├── index.astro  # Help docs category index (Contentful docCategory + docArticle)
│       └── [slug].astro # Individual doc article with sidebar nav
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
- `GET /api/v1/landing/stats`: player_count, tournament_count, army_list_count, region_count (public, cached)
- `GET /api/v1/landing/regions`: `{ regions: [...] }` with slug, country_flag, country_codes, player_count, tournament_count, has_masters (public, cached)
- `GET /api/v1/landing/region/:code`: region summary, `upcoming_events` (next 5, `live` flag), `top_players` (5) and `top_players_scope` (`season` or `global`) (public, cached)
- `GET /api/v1/landing/galleries`: `{ galleries: [...] }` top 6 with title, faction_name, image_url, rating, url (public, cached)
- `GET /api/v1/landing/rankings`: global top 5 offline/total (+ factions), with display names and profile `url` (public, cached)
- `GET /api/v1/landing/me`: full_name, email, avatar_url, region_flag, region_name, region_slug, player_slug (authenticated, 401 if anonymous)
- `GET /api/v1/search?q=...`: `{ players: [...], tournaments: [...] }` (public)

Event dates from the API are calendar days in the event's zone: format them from the `YYYY-MM-DD` parts, never `new Date(string)`.

- Client-side interactivity via module `<script>` tags importing from `../lib/api`
- API data fetched client-side (progressive enhancement — page works without API)
- Use `class:list` for conditional classes

### Nav Personalisation
The top right must match the Rails app exactly (`StaticPageLayout.tsx` + `layouts/ProfileDropdown.tsx`). Signed out: one gold "Login" button with the gold glow. When JS runs it calls `/api/v1/landing/me`; if authenticated it swaps to:
- **Desktop:** gold "<flag> Dashboard" button (`rounded-md`, black text) + 40px avatar with a 2px gold border (initials fallback uses react-avatar's colour algorithm, as Rails does)
- **Dropdown:** `bg-owr-black`, `border-owr-gold/30`, gold glow; name in gold, email in silver; items My Player Profile, Battle Builder, My Events, Profile Settings, What's new on OWR? with 16px gold Lucide icons and a dark red hover. Log out is not on www yet (Rails signs out via `DELETE /logout` with CSRF)
- If the API returns 401 or fails, the anonymous state stays (no visible change)

### Styling
- Tailwind utility-first, custom colors via `@theme` directive (Tailwind 4 pattern)
- NO separate tailwind.config.js — everything in global.css
- Icons: Inline SVG paths (no icon library dependency)
- Responsive: `sm:` (640px), `md:` (768px), `lg:` (1024px)

### Links

**Trailing-slash convention: always use trailing slashes on internal links to this site.** Astro builds emit `dist/<page>/index.html` (directory format), the sitemap generates trailing-slash URLs, and Netlify 301-redirects no-slash → slash. Internal links must match the canonical form to avoid redirect chains that dilute SEO equity and confuse crawlers.

- ✅ `href="/whatsnew/"`, `href="/newsletter/"`, `href="/pricing/"`
- ✅ Dynamic: `` href={`/newsletter/${slug}/`} ``
- ✅ Anchors on the same page: `href="/whatsnew/#${slug}"` (slash before the `#`)
- ❌ `href="/whatsnew"` — triggers a 301 to `/whatsnew/`
- Hash-only links (`/#features`) on the homepage are fine as-is (no path segment)

This applies to:
- All `<a href>` in components and pages
- Absolute URLs embedded in attributes (share buttons, `og:url`, structured data)
- Anywhere a path is built via template strings

**Exception:** links to the Rails app (`${APP_URL}/...`) use no-slash — that's the Rails convention on `oldworldrankings.com`. Don't mix the two.

Other link rules:
- App links: Use `APP_URL` variable (`${APP_URL}/login`, `${APP_URL}/register`)
- External links: `target="_blank" rel="noopener noreferrer"`
- Scroll targets: `id="section-name"` + `scroll-mt-20` class

### Newsletter UTM Tags

`tools/newsletter/render.mjs` tags every newsletter link into a site we own. **Do not hand-write UTMs into Contentful** — the renderer knows the issue slug and the section, and hand-tagged links drift between issues.

| Param | Value |
|---|---|
| `utm_source` | `newsletter` |
| `utm_medium` | `email` |
| `utm_campaign` | the issue slug (`july-2026`) |
| `utm_content` | the enclosing heading slug, or the embed `kind` for CTAs |

Left untagged on purpose: external hosts (YouTube, `help.oldworldrankings.com`), `/sponsor-ads/*/click` URLs (Rails tags those downstream via `AdServing::DestinationUrlBuilder`), and the sidecar `web_url` (a canonical URL - campaign params there would fragment the page's own analytics). A link already carrying `utm_source` is treated as a deliberate override and left alone.

This is **not** the same scheme as the sponsor ad tagging in the Rails app, and shouldn't be merged with it: sponsor links point outward, where OWR is the source; these point inward, where the newsletter is.

**Render with production URLs or the links go out broken and untagged** - the committed `.env` points `PUBLIC_APP_URL` at local dev:

```bash
PUBLIC_APP_URL=https://oldworldrankings.com pnpm newsletter:render <slug>
```

The renderer prints a warning if you forget.

## Contentful CMS Integration

### Overview

Content for `/docs` and `/whatsnew` is managed in Contentful (space `ry0ysk99xuno`, environment `master`). Pages fetch content at **build time** via the Contentful Delivery/Preview API — no client-side fetching.

- `src/lib/contentful.ts` — Client singleton. Returns `null` when env vars are missing (pages render empty state).
- `src/lib/contentful-types.ts` — TypeScript skeletons for all content types.
- `src/lib/rich-text.ts` — Converts Contentful Rich Text documents to styled HTML using `@contentful/rich-text-html-renderer`. Output uses OWR Tailwind classes matching `privacy.astro`/`terms.astro` styling.

### Content Types

#### `docCategory` — Help doc categories
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | Symbol | Yes | Unique |
| `slug` | Symbol | Yes | Unique, kebab-case (`^[a-z0-9]+(?:-[a-z0-9]+)*$`) |
| `description` | Text | No | Max 300 chars |
| `icon` | Symbol | No | SVG path data for inline icon |
| `order` | Integer | Yes | 0–100, controls sort order |

#### `docArticle` — Help doc articles
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | Symbol | Yes | — |
| `slug` | Symbol | Yes | Unique, kebab-case |
| `category` | Link → `docCategory` | Yes | Single reference |
| `tags` | Array of Symbols | No | Predefined: `players`, `tournament-organizers`, `pro`, `army-lists`, `rankings`, `getting-started`, `regions`, `galleries` |
| `excerpt` | Symbol | No | Max 200 chars, shown on card |
| `body` | Rich Text | Yes | Headings 2–4, lists, blockquote, hr, table, embedded-asset, hyperlink |
| `order` | Integer | Yes | 0–100, sort within category |
| `relatedArticles` | Array of Links → `docArticle` | No | Max 3 |

#### `changelogEntry` — What's New entries
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | Symbol | Yes | — |
| `date` | Date | Yes | Used for grouping by month/year and sort order |
| `category` | Symbol | Yes | One of: `New`, `Improvement`, `Fix` |
| `description` | Rich Text | Yes | Headings 3–4, lists, blockquote, embedded-asset, hyperlink |

### Managing Content via Contentful MCP

The Contentful MCP server (`mcp__contentful-mcp__*`) is configured and can manage content directly from Claude Code. Common workflows:

**Create a changelog entry:**
1. Upload any images first: `mcp__contentful-mcp__upload_asset` (pass image URL in `file.upload`)
2. Publish the asset: `mcp__contentful-mcp__publish_asset`
3. Create entry: `mcp__contentful-mcp__create_entry` with `contentTypeId: "changelogEntry"`
4. Publish entry: `mcp__contentful-mcp__publish_entry`

**Important MCP conventions:**
- All field values **must** include a locale key: `{ "title": { "en-US": "My Title" } }`
- Rich text fields use Contentful's document format with `nodeType`, `content`, `data`, `marks` structure
- Text nodes need `"marks": []` even when no formatting is applied
- Embedded assets in rich text use `nodeType: "embedded-asset-block"` with `data.target.sys` linking to the asset
- Hyperlinks use `nodeType: "hyperlink"` with `data.uri`
- Space ID: `ry0ysk99xuno`, Environment: `master`

**Useful MCP tools:**
- `mcp__contentful-mcp__create_entry` / `update_entry` / `publish_entry`
- `mcp__contentful-mcp__upload_asset` / `publish_asset`
- `mcp__contentful-mcp__search_entries` — find existing content
- `mcp__contentful-mcp__list_content_types` — verify schema
- `mcp__contentful-mcp__create_content_type` / `publish_content_type` — schema changes

### Uploading Images to Contentful

Contentful's `upload_asset` requires a **publicly accessible URL** — localhost won't work. Use ngrok to tunnel a local file server:

```bash
# 1. Start a Python HTTP server in the directory containing images
#    (done via openbrowser execute_code or manually)
python3 -m http.server 8765 --directory /path/to/images

# 2. Tunnel it with ngrok
ngrok http 8765

# 3. Use the ngrok URL in the upload_asset call
mcp__contentful-mcp__upload_asset  file.upload = "https://<ngrok-url>/image.png"

# 4. Publish the asset, then embed it in rich text via embedded-asset-block
# 5. Kill ngrok when done: pkill ngrok
```

### Creating Help Doc Articles

**Workflow for a new docArticle:**

1. Upload & publish image assets (see above)
2. Create entry with `contentTypeId: "docArticle"`, linking to a `docCategory`
3. Build the `body` as Contentful Rich Text (see conventions above)
4. Embed images using `embedded-asset-block` nodes referencing the asset ID
5. Publish the entry

**Existing doc categories:**

| Category | ID | Slug |
|----------|-----|------|
| Tournament Hosting | `46Oro3c40AKAkiXynbiafT` | `tournament-hosting` |

**Tags available for docArticle:** `players`, `tournament-organizers`, `pro`, `army-lists`, `rankings`, `getting-started`, `regions`, `galleries`

### Build & Deploy

This is a **static site** — content changes in Contentful require a site rebuild.

- **Local:** `pnpm build` fetches from Contentful Delivery API (or Preview API in dev)
- **Production:** Netlify build hook triggered by Contentful webhook on entry publish/unpublish
- **Graceful degradation:** If Contentful is unconfigured or content types don't exist, pages render empty states (no build failures)

## Documentation Drafts (`docs/`)

The `docs/` directory contains working drafts of help documentation, written as markdown files alongside PNG screenshots. These serve as source material for Contentful docArticle entries.

### Private Notes (`docs/private/`)

**`docs/private/` is gitignored.** Put anything here that shouldn't be in the public repo: strategy notes, competitive analysis, traffic/revenue numbers, draft content, internal TODOs, anything that's useful for working context but isn't for public consumption. Never commit files from this directory. If you find yourself adding docs that feel like planning/strategy rather than reference material, default to `docs/private/`.

### `docs/tournament-hosting-guide/`

Markdown + screenshot files for each tab in the tournament hosting flow. Each `.md` file has YAML frontmatter with metadata (title, slug, order, URL path, screenshot filenames, section).

**Files:** `01-create-tournament.md` through `09-communications.md` plus `10-battle-board.md`, with corresponding `.png` screenshots.

### Workflow: Documenting App Features with openbrowser MCP

Use the `mcp__openbrowser__execute_code` tool to navigate the Rails app at `https://owr-local.site:5100`, interact with pages, and take screenshots for documentation.

**Screenshot workflow:**
1. Navigate to the page: `await navigate('https://owr-local.site:5100/...')`
2. Get the main content area bounds (exclude sidebar/nav):
   ```python
   result = await evaluate("""
       const allDivs = document.querySelectorAll('div');
       let bestMatch = null; let bestArea = 0;
       for (const div of allDivs) {
           const rect = div.getBoundingClientRect();
           if (rect.x > 100 && rect.width > 500 && rect.height > 400) {
               const area = rect.width * rect.height;
               const hasH1 = div.querySelector('h1');
               if (hasH1 && area > bestArea) {
                   bestMatch = { x: Math.round(rect.x), y: Math.round(rect.y),
                                 w: Math.round(rect.width), h: Math.round(rect.height) };
                   bestArea = area;
               }
           }
       }
       return bestMatch;
   """)
   ```
3. Take a clipped full-page screenshot (sidebar/nav excluded):
   ```python
   await browser.take_screenshot(
       path="/path/to/output.png",
       full_page=True,
       clip={"x": result['x'], "y": 48, "width": result['w'], "height": result['h']}
   )
   ```
4. For detail shots of specific components, scroll them into view first, then take a plain viewport screenshot (`full_page=False`, no clip) — `clip` uses CSS pixels but viewport screenshots avoid DPI scaling issues.

**Key gotchas:**
- `screenshot_element()` and `clip` with viewport coordinates can produce black images due to device pixel ratio. Prefer full-page clip for main content, plain viewport shots for detail areas.
- Always `await evaluate("window.scrollTo(0, 0)")` before full-page screenshots.
- Get fresh `browser.get_browser_state_summary()` after any navigation — element indices go stale.
- The user must log in manually before the browser can access authenticated pages.

**Typical app structure for TO pages:**
- Setup tabs: Overview, Dates & Payment, Documents, Staff, Attendees, Scoring, Rounds, Communications
- URL pattern: `/au/tournaments/hosted/{slug}/{tab}`
- Battle Board (display screen): `/au/tournaments/{slug}/battleboard`

## Future Work

### Additional Pages Planned
- `/about` — Team/project story
- `/blog` — Content marketing (Contentful)
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

## Jira labels

Tickets get logged across repo boundaries, so label by where the work lands, not by which repo you are in. Full standard: `/Users/colin/dev/tributech/owr-apps/project-management/JIRA-STANDARDS.md`.

Every ticket = **exactly one `app:*`** + **0-2 `area:*`**. Never invent labels or duplicate the issue type (no `tech-debt`, `enhancement`, `bugfix`).

**Component `app:*`** (this repo defaults to `app:website`):
- `app:web` - Rails + Inertia/React main app (incl. Grape mobile API)
- `app:battle-builder` - HammerHub Battle Builder
- `app:mobile` - Capacitor app + native iOS/Android shells
- `app:owb` - old-world-builder forks
- `app:website` - Astro marketing sites (owr-website, hammerhub-website)
- `app:infra` - Terraform, CI/CD, deploy, ops

**Domain `area:*`** (0-2): `rankings` `tournaments` `hosting` `stats` `scoring` `data-sync` `payments` `notifications` `auth` `i18n` `performance` `security` `gallery` `teams` `clubs`

**Meta**: `needs-triage` (auto-created / unreviewed), `40k` (40k-launch path), `community-request`, `blocked`, `player-report`.

**Types**: `Epic` groups children; `Big Idea` = unshaped / no children; plus `Story` `Task` `Tech Debt` `Bug` `Data Task`. Priority defaults Medium; High only for next-up / 40k-launch.
