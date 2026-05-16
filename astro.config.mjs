// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://voidhaus.vercel.app',
  output: 'static',
  adapter: vercel(),

  vite: {
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && String(warning.id ?? '').includes('svelte')) return;
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.exporter === 'svelte/transition') return;
          warn(warning);
        },
      },
    },
  },

  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: 'Instrument Sans',
      cssVariable: '--font-sans',
      weights: [200, 300, 400, 500],
      styles: ['normal'],
    },
    {
      provider: fontProviders.fontsource(),
      name: 'Cormorant',
      cssVariable: '--font-serif',
      weights: [300, 400, 500],
      styles: ['italic'],
    },
  ],

  integrations: [
    svelte(),
    sitemap({
      filter: page => !page.includes('/404'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
  ],
});
