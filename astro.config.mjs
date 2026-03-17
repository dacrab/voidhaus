// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://voidhaus.vercel.app',
  output: 'static',
  integrations: [
    svelte(),
    sitemap({
      // Exclude legal/utility pages from sitemap priority
      filter: page => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
