# counter-strike-stats-extension-landing

Landing page of **Counter-Strike Stats**, the browser extension that displays Counter-Strike stats (csstats.gg,
FACEIT and Leetify) directly on Steam profiles. One static English page with no scroll on any viewport, links to the
Chrome Web Store and Firefox Add-ons, and lives at https://cs-stats-extension.jagoba.dev.

## Stack

Astro (static + per-route SSR) · Tailwind CSS · TypeScript strict · astro-icon (simple-icons) · animejs ·
Content Collections + Zod · `@astrojs/node` (standalone) · `@astrojs/sitemap` · self-hosted fonts (Audiowide,
Inter, JetBrains Mono) · Prettier · Playwright + axe-core · GitHub Actions CI (build / format / audit / e2e) ·
Dependabot.

## Scripts

```bash
npm install
npm run dev           # http://localhost:4321
npm run build         # static build
npm run preview       # serve the build
npm run format        # Prettier (CI runs format:check)
npm run format:check
npm run test:e2e      # astro build + Playwright on astro preview (Chromium, Firefox, WebKit)
```

Run `npx playwright install` once before the first `test:e2e`.

## Structure

```
public/                 robots.txt, manifest.webmanifest, imgs/ (favicons, og-image.png)
src/assets/             logo and the two extension screenshots (hero image and JSON-LD screenshots, optimised by astro:assets)
src/content/pages/      all page copy (index.json, 404.json), schema in src/content.config.ts
src/components/         pages/ (IndexPage, NotFoundPage), sections/, ui/
src/layouts/            BaseLayout.astro (head, SEO, Open Graph, JSON-LD)
src/lib/                seo.ts (site constants, JSON-LD), types.ts
src/scripts/            animations.ts (entrance and button press, reduced-motion aware)
src/styles/global.css   Tailwind import and Cybercore design tokens
tests/e2e/              Playwright specs: layout (no scroll), links, SEO, accessibility, motion, runtime
```

## Conventions

All project conventions live in the project-scoped skill:

```
/astro-implement
```

Use it whenever you add or modify a page, component, content collection, script or any other
piece of this codebase so the result stays consistent with the established style.

See `TODO.md` for the pending deployment and post-deployment SEO tasks.
