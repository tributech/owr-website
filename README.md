# OWR Website

Marketing and content site for [Old World Rankings](https://www.oldworldrankings.com). Built with Astro, Tailwind CSS 4, and deployed to Netlify.

## Prerequisites

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

Runs at [localhost:4321](http://localhost:4321).

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
