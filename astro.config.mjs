// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://voidhaus.vercel.app',
  output: 'static',

  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Svelte transition imports (fade, fly etc) are used in templates
          // but Vite's static analyser can't see them — suppress the false positive
          if (warning.code === 'UNUSED_EXTERNAL_IMPORT' && warning.source?.includes('svelte')) return;
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
      name: 'DM Sans',
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
