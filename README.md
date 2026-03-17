# VOIDHAUS

A demo luxury fashion brand site built with Astro 6, Svelte 5, and GSAP.

> "Wear the void."

---

## Stack

| Layer | Technology |
|---|---|
| Framework | [Astro 6](https://astro.build) — zero-JS shell, static generation |
| Interactivity | [Svelte 5](https://svelte.dev) — islands (Nav, Cart) with Runes |
| Animation | [GSAP 3](https://gsap.com) + ScrollTrigger |
| Fonts | DM Sans Variable + Cormorant Variable via [Fontsource](https://fontsource.org) |
| Styling | Pure CSS custom properties — no utility framework |
| Package manager | [Bun](https://bun.sh) |

---

## Pages

| Route | Description |
|---|---|
| `/` | Hero, featured products, editorial quote |
| `/collection` | Full product grid with category filters |
| `/product/[slug]` | Split-screen product detail with sticky image |
| `/lookbook` | Three editorial chapters with scroll parallax |
| `/about` | Brand manifesto + atelier locations |
| `/contact` | Contact form + studio info |

---

## Project Structure

```
src/
├── components/
│   ├── Cart.svelte       # Persistent cart drawer (Svelte 5 island)
│   ├── Nav.svelte        # Header + mobile menu (Svelte 5 island)
│   └── PageHeader.astro  # Reusable page header component
├── data/
│   ├── products.ts       # Product catalog, types, shared constants
│   └── site.ts           # Brand config (name, email, ateliers)
├── layouts/
│   └── Layout.astro      # Base HTML shell, FOUC prevention
├── lib/
│   ├── animate.ts        # GSAP animation system (opacity-only text reveals)
│   └── toggle.ts         # Toggle group utility
├── pages/
│   ├── index.astro
│   ├── collection/
│   ├── product/[slug].astro
│   ├── lookbook/
│   ├── about/
│   └── contact/
└── styles/
    └── global.css        # Design tokens, reset, typography, animation states
```

---

## Design Principles

Inspired by Rick Owens, Maison Margiela, The Row, Lemaire, and Jil Sander:

- **Warm off-white background** — `#faf9f7`, never pure white
- **DM Sans Variable** for UI — geometric, close to Gotham
- **Cormorant Variable** for editorial moments — italic only, high contrast
- **Zero border-radius** globally
- **Non-sticky navigation** — luxury brands don't chase you down the page
- **Opacity hierarchy** — everything `0.4` by default, `1` on interaction
- **Silence as design** — aggressive whitespace, nothing competes

---

## Animation System

All animations live in `src/lib/animate.ts`. The core rule:

> **Text elements: opacity only. Never translateY. Never transforms.**

Any Y-axis transform on text causes subpixel rounding artifacts when
the transform is removed — making text appear to shift or jump.
Luxury sites (Louis Vuitton, The Row) use pure opacity fades. We do the same.

Transforms are used **only** on images — for Ken Burns entrances and scroll parallax.

```ts
// Text — opacity only
revealHero()       // fires after fonts.ready, no scroll trigger
revealOnScroll()   // ScrollTrigger, opacity fade only
staggerReveal()    // group stagger, opacity only

// Images only — transforms allowed
heroParallax()     // scale entrance + scrubbed parallax
imageEntrance()    // scale entrance, GSAP owns transform permanently
chapterParallax()  // per-chapter lookbook parallax
```

### FOUC Prevention

```html
<!-- Inline blocking script in <head> — runs before first paint -->
<script is:inline>
  document.fonts.ready.then(() =>
    document.documentElement.classList.add('fonts-loaded')
  );
  setTimeout(() =>
    document.documentElement.classList.add('fonts-loaded')
  , 600); // failsafe
</script>
```

```css
html               { visibility: hidden; }
html.fonts-loaded  { visibility: visible; }
body               { opacity: 0; transition: opacity 0.4s ease; }
html.fonts-loaded body { opacity: 1; }
```

---

## Cart / Selection

Svelte 5 island using `$state` and `$derived` runes. Persists to `localStorage`.
Communication via custom browser events — fully decoupled from page code:

```ts
// Add item from product page
window.dispatchEvent(new CustomEvent('vh:add-to-cart', { detail: { ...product, size } }));

// Open drawer from nav
window.dispatchEvent(new Event('vh:open-cart'));
```

---

## Development

```bash
bun install
bun run dev
```

Open [http://localhost:4321](http://localhost:4321)

## Build

```bash
bun run build
bun run preview
```

---

## Deployment

Designed for [Vercel](https://vercel.com). No config needed — Astro static output works out of the box.

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

Or connect the GitHub repo to Vercel for automatic deployments on push.

---

## License

Private. All rights reserved.
