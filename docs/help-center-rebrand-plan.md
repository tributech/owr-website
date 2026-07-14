# Help Center Rebrand + Usefulness Plan (help.oldworldrankings.com)

**Product:** Banshee help center (banshee.chat), admin at `app.banshee.chat`, live at `https://help.oldworldrankings.com`.
**Goal:** Make the help center (a) genuinely useful and accurate to the real Rails app, and (b) look properly OWR-branded (gold `#FFD700` on black, Montserrat).
**Driven via:** `banshee` MCP for content/structure/covers; **Chrome** for visual iteration; **banshee admin UI** for the few styling tokens the MCP can't set.

Status as of this writing: diagnosis done, content audit done, no changes applied yet except a template switch to `atlas` (kept, per Colin).

---

## 1. TL;DR — is the MCP "just missing a few styling gaps"?

Yes. The banshee MCP is **content- and structure-complete** but has exactly **four global-styling gaps** that force you into the admin UI:

| Gap | Token / field | Current value | Wanted | Exposed by MCP? |
|-----|---------------|---------------|--------|-----------------|
| Accent color | `--hc-accent` | `#10b981` (emerald) | `#FFD700` (OWR gold) | **No** |
| Primary color | `--hc-primary` | `#000000` (black) | keep black | **No** (can't override) |
| Font family | `--hc-font` | system sans stack | Montserrat | **No** |
| Hero heading/subtext | `hero_heading`, `hero_subtext` | empty (falls back to "How can we help?") | OWR copy | **Read-only** (no setter) |

Everything else is fully drivable from the MCP (see §3). These four are the only reason we need `app.banshee.chat`.

**Feedback for the banshee dev:** add setters for `accent`/`primary`/`font`/`hero_heading`/`hero_subtext` — e.g. extend `update_help_center_theme` with optional `accent_color`, `primary_color`, `font`, `hero_heading`, `hero_subtext`. That would make the help center 100% MCP-managed and remove the only manual step.

---

## 2. Current state (diagnosed live)

- **Template:** was `aurora` (green mesh hero); switched to **`atlas`** and keeping it.
- **Root theme tokens** (read from live CSS):
  - `--hc-primary: #000000`, `--hc-primary-foreground: #ffffff`
  - `--hc-accent: #10b981` (emerald — this drives the green hero gradient, search focus ring, "OWR HELP CENTER" pill dot, category-count pills, link color)
  - `--hc-accent-foreground: #0a0a0a`
  - `--hc-radius: 0.625rem`
  - `--hc-font: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` (NOT Montserrat)
- **Nav:** none set (MCP `nav_links: []`). Header shows "Contact us" only (atlas default).
- **Footer:** two columns (Old World Rankings / Support), `show_powered_by: true` (links to banshee.chat).
- **GA4:** `G-9FTMX2L8GC` wired.
- **Content:** 9 categories, 31 articles, all published (see §5). Bodies were seeded ~2026-06-12; low view counts; not yet verified against the current app.

### Environment quirks worth knowing
- The claude-in-chrome MCP window was stuck at 430px CSS width for the first few loads, then picked up 1440px after a template change + reload. If screenshots come back mobile-width, reload the tab.
- `--hc-*` tokens are the brand config; they are set server-side from admin theme settings, not via MCP.

---

## 3. What the MCP CAN do (no admin needed)

- **Template + hero gradient style + nav links:** `update_help_center_theme` (template classic/aurora/atlas; gradient mesh/soft/solid is Aurora-only; nav_links replaces all).
- **Footer:** `update_help_center_footer` (columns, text, powered-by flag).
- **Categories:** `upsert_help_category` — name, description, `icon` (Lucide), `parent_slug` (max depth 3), `section` grouping label, `position`, `published`, and **covers**: `cover_color` ('primary' | 'accent' | **raw hex**), `cover_pattern` (15 options), `cover_icon`.
- **Articles:** `upsert_help_article` — title, `content_html` (rich, sanitized: h2-h4, lists, tables, blockquote, pre/code, hr, details/summary collapsibles, `<div data-type="toc">`, images, YouTube/Loom embeds), `summary`, `tags`, `category_slug`, `position`, `featured`, `published`, `seo_title`/`seo_description`, and the same cover fields.
- **Images:** `upload_image` (fetches a PUBLIC url, downscales to 1600px, re-encodes WebP) → returns URL + width/height for `<img>`.
- **Covers give us gold WITHOUT the admin:** `cover_color: "#FFD700"` on every category + featured article = MCP-driven gold branding on all the cards/headers.

**Cover patterns available:** dots, dots-lg, grid, diagonal, stripes, crosshatch, plus, rings, chevron, diamonds, triangles, checker, waves, confetti, zigzag.

---

## 4. What needs the admin UI (app.banshee.chat)

Only the four §1 gaps:
1. Set **accent** = `#FFD700`.
2. Confirm **primary** = black (`#1C1C1C` or `#000000`).
3. Set **font** = Montserrat.
4. Set **hero heading/subtext** OWR copy (optional; MCP can't, admin can).

Requires Colin logged in (Continue with Google). Claude cannot enter credentials / complete auth. Once logged in, Claude can drive the admin UI clicks to make these changes and iterate visually in Chrome.

Suggested hero copy:
- Heading: "Old World Rankings Help"
- Subtext: "Guides for players and tournament organisers. Register, run events, score games, and climb the rankings."

---

## 5. Content: current articles + correctness map

The repo already contains the source-of-truth drafts that map ~1:1 to the live articles:
- `docs/player-guide/` — 10 docs (find/register, army list, check-in, battle hub, pairings, scoring battle/confirm/soft, standings/history, refunds). Player flows live at `/au/tournaments/{slug}/register`, `/register/confirmation`, and the tabbed Battle Hub `/au/tournaments/{slug}/hub`.
- `docs/tournament-hosting-guide/` — 9 docs (create, overview, dates & payment, documents, staff, attendees, scoring, rounds, communications). TO setup lives at `/au/tournaments/hosted/{slug}/{tab}`; creation at `/au/tournaments/hosted/new`.
- `docs/stripe-setup/` — 13 screenshots, NO written guide (organiser bank/Stripe onboarding).

### Live categories (9)
getting-started, registering-for-events, event-day-the-battle-hub, scoring-your-games, doubles-teams, hosting-a-tournament (parent) → building-your-event + running-game-day (children), faq.

### Live articles (31)
Getting Started: create-your-owr-account, set-up-your-player-profile, regions-how-rankings-work.
Registering for Events: find-register-for-a-tournament, submit-your-army-list, refunds-cancellations.
Event Day & the Battle Hub: the-battle-hub, check-in-on-event-day, pairings-your-match, follow-events-get-notified.
Scoring Your Games: scoring-battle-results, scoring-confirm-edit, scoring-soft-scores-voting, standings-match-history.
Doubles & Teams: singles-doubles-teams-explained, registering-pairing-as-a-team, scoring-in-doubles-team-events.
Building Your Event: create-a-tournament, the-tournament-overview, dates-payment, setting-up-stripe-payments, documents, staff, attendees, scoring-setup, rounds.
Running Game Day: communications, running-rounds-on-the-battle-board.
FAQ: faq-pairings-tiebreakers-strength-of-schedule, player-faq, organiser-faq.

### Gaps flagged by the audit (candidate new/expanded articles)
1. **Battle Board (TO game-day)** — running rounds, generating pairings, advancing rounds, publishing results. Screenshots exist (`10-battle-board*.png`); no prose. `running-rounds-on-the-battle-board` exists but should be verified/expanded.
2. **Stripe / bank onboarding** — 13 screenshots, no guide. `setting-up-stripe-payments` exists; verify depth.
3. **TO list approval / review workflow** — players see approval statuses; no organiser-side doc.
4. **Account / player profile creation** — prerequisite, exists as articles; verify accuracy.
5. Missing player-guide detail screenshots (5 PNGs referenced in frontmatter but absent).

**Correctness rule:** verify every documented step/label against the LIVE app before rewriting. Colin chose **local dev** (`https://owr-local.site:5100`, `bin/dev` running, Colin logged in) as the verification surface.

**Writing rule (hard):** NO em-dashes or en-dashes anywhere in user-facing copy. Use " - ", commas, colons, or parentheses. (Repo-wide OWR rule.)

**Content style (Colin, confirmed):** Keep text CONCISE and scannable - do NOT exhaust every field/detail in prose. Colin provides screenshots and (probably) YouTube videos; the media carries the detailed walkthrough. So each article = short intro + key steps/what-matters + a slot for a screenshot and/or YT embed + a "Related" cross-link footer. Banshee supports YT embeds: `<div data-youtube-video><iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" width="640" height="360" allowfullscreen="true"></iframe></div>`. Lean on video for step-by-step; use text for orientation + gotchas.

**Media workflow:** banshee `upload_image` needs a PUBLIC url (local screenshots need an ngrok tunnel first, per repo stripe-setup pattern). Colin supplies screenshots/video; Claude writes lean text around them and embeds. Don't block text work waiting on media - leave the flow accurate and add media in a second pass.

**Content finding (verified):** existing seeded articles are ACCURATE and well-structured (verified create-a-tournament vs live /au/tournaments/hosted/new). So the pass = accuracy spot-checks + gap-fill + cross-linking + trimming bloat, NOT wholesale rewrites.

---

## 6. Execution plan / task list

1. **[admin]** Set brand theme in banshee admin: accent `#FFD700`, primary black, font Montserrat, keep atlas. Iterate visually in Chrome. (Blocked on Colin login.)
2. **[done]** Audit help content vs repo drafts.
3. **[local dev]** Verify each doc against live Rails app functionality. (Needs Colin logged into local dev.)
4. **[MCP]** Full usefulness pass: rewrite/restructure article bodies, fix categories, add cross-links, strengthen getting-started path, fill gaps (Battle Board TO, Stripe, list approval). Blocked by (2)+(3).
5. **[MCP]** Brand every category + featured article cover: `cover_color: "#FFD700"`, tasteful `cover_pattern` per category, meaningful `cover_icon`. Pick a strong featured set (~4-6).
6. **[MCP]** Set OWR nav links (Home / Upcoming Events / Host a Tournament / Back to app), footer columns, and hero copy (hero via admin).

### Recommended cover scheme (gold on black, per category)
- getting-started → icon `rocket`, pattern `rings`
- registering-for-events → icon `ticket`, pattern `diagonal`
- event-day-the-battle-hub → icon `swords`, pattern `chevron`
- scoring-your-games → icon `calculator`, pattern `grid`
- doubles-teams → icon `users`, pattern `triangles`
- hosting-a-tournament → icon `shield`, pattern `crosshatch`
- faq → icon `circle-help`, pattern `dots`

### Suggested nav links (MCP)
`[{label:"Old World Rankings", url:"https://oldworldrankings.com"}, {label:"Upcoming Events", url:"https://oldworldrankings.com/..."}, {label:"Host a Tournament", url:"https://oldworldrankings.com/..."}]` — confirm exact app URLs before setting.

---

## 7. Handoff notes for codex / next session

- The two human-only blockers: (a) log into `app.banshee.chat` for the 4 styling tokens; (b) `bin/dev` up + logged into `https://owr-local.site:5100` for doc verification.
- Don't trust existing article bodies; verify against the live app first.
- Gold covers can proceed via MCP with zero login — safe to start there for immediate visible progress.
- Keep the atlas template.
- Respect the no-dashes rule.
- Banshee MCP tool surface (11 tools): get/list/upsert/delete for categories + articles, get_help_center_settings, update_help_center_theme, update_help_center_footer, upload_image. No brand-color/font/hero-copy setter exists.
