// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://www.oldworldrankings.com',
  integrations: [react()],
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
