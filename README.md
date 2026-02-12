# OWR Website

Marketing and content site for [Old World Rankings](https://www.oldworldrankings.com). Built with Astro, Tailwind CSS 4, and deployed to Netlify.

## Prerequisites

- Node.js 20+
- pnpm
- [Caddy](https://caddyserver.com/) (`brew install caddy`)

## Setup

```bash
pnpm install
caddy trust   # one-time: install Caddy's local CA in your system trust store
```

## Development

```bash
# Terminal 1: Astro dev server (internal port)
pnpm dev

# Terminal 2: Caddy reverse proxy (HTTPS termination)
caddy run --config Caddyfile
```

Site available at [https://www.owr-local.site:5090](https://www.owr-local.site:5090).

### Local Domain Setup

Both apps use HTTPS locally via Caddy (`tls internal`) so that session cookies and OAuth work correctly across subdomains.

| Service | External URL (Caddy HTTPS) | Internal port | Prod URL |
|---------|---------------------------|---------------|----------|
| Rails app | `https://owr-local.site:5100` | `localhost:5101` | `https://oldworldrankings.com` |
| Astro marketing | `https://www.owr-local.site:5090` | `localhost:5091` | `https://www.oldworldrankings.com` |
| Cookie domain | `.owr-local.site` | — | `.oldworldrankings.com` |

DNS is managed in Namecheap — both `@` and `www` A records point to `127.0.0.1`. No `/etc/hosts` changes needed.

## Environment Variables

Copy `.env.example` or set these in your shell / Netlify dashboard:

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_APP_URL` | URL of the Rails app | `https://oldworldrankings.com` |
| `PUBLIC_GA_ID` | Google Analytics ID | — |

## Build

```bash
pnpm build
pnpm preview   # preview the production build locally
```

Output goes to `dist/`.

## Deployment

Netlify builds automatically on push. Config is in `netlify.toml`.

- **Build command:** `pnpm build`
- **Publish directory:** `dist`
- **Node version:** 20

API requests to `/api/*` are proxied to the Rails backend via Netlify redirects.
