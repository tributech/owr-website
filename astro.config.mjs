// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.oldworldrankings.com',
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['www.owr-local.site'],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5091,
  },
});
