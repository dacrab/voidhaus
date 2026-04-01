# VOIDHAUS

A minimal luxury fashion e-commerce site built with [Astro](https://astro.build) and [Svelte 5](https://svelte.dev). Static-generated, fast, and designed to be a solid foundation for a high-end fashion storefront.

## Stack

- **[Astro 6](https://astro.build)** — static site generation, file-based routing, view transitions
- **[Svelte 5](https://svelte.dev)** — interactive components (nav, cart, size guide)
- **[GSAP](https://gsap.com)** — scroll-triggered and hero animations
- **[TypeScript](https://www.typescriptlang.org)** — strict mode throughout
- **[Fontsource](https://fontsource.org)** — self-hosted variable fonts (DM Sans + Cormorant)
- **[Sharp](https://sharp.pixelplumbing.com)** — image optimisation (AVIF/WebP)

## Features

- **12-piece product catalogue** — outerwear, tailoring, knitwear, footwear, accessories
- **Shopping cart** — localStorage-backed, slide-in panel, focus-trapped
- **Size guide** — modal with clothing and footwear sizing tables
- **Lookbook** — editorially structured chapters with curated product groupings
- **Stockists** — global retailer listings grouped by region
- **GDPR-ready** — minimal cookies, full privacy and terms pages
- **SEO** — schema.org `ClothingStore`, OpenGraph, Twitter cards, sitemap
- **Accessible** — semantic HTML, focus management, `prefers-reduced-motion` respected

## Pages

| Route | Description |
|---|---|
| `/` | Hero landing with featured products |
| `/collection` | Full product grid with category filters |
| `/product/[slug]` | Product detail, specs, sizing, related items |
| `/lookbook` | Three thematic editorial chapters |
| `/about` | Brand manifesto and atelier locations |
| `/contact` | Contact form with subject chips |
| `/stockists` | Global retailers by region |
| `/privacy` | Privacy policy |
| `/terms` | Terms & conditions |

## Getting started

Requires **Node 22.12+** (or [Bun](https://bun.sh)).

```bash
# install
bun install   # or: npm install

# dev server
bun dev       # or: npm run dev

# production build
bun run build # or: npm run build

# preview build locally
bun preview   # or: npm run preview
```

## Project structure

```
src/
├── assets/         # image imports & metadata
├── components/     # Astro + Svelte components
├── data/           # products.ts, site.ts
├── layouts/        # Layout.astro (shell, SEO, footer)
├── lib/            # animation, scroll-lock, toggle utilities
├── pages/          # file-based routes
└── styles/         # global.css (design tokens, grid, animations)
```

## Customising

- **Brand / contact info** → `src/data/site.ts`
- **Products** → `src/data/products.ts`
- **Images** → `src/assets/img/` + `src/assets/images.ts`
- **Colours & type** → CSS custom properties in `src/styles/global.css`
- **Fonts** → swap Fontsource packages in `package.json` and update `astro.config.mjs`

## Deployment

The site outputs static files (`output: 'static'`) and is configured for **Vercel** out of the box. It will work equally well on Netlify, Cloudflare Pages, or any static host — just drop the `@astrojs/vercel` adapter from `astro.config.mjs` if needed.

## Licence

MIT
