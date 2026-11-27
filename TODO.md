# TODO

## Assets

- [x] Favicons and app icons in `public/imgs/favicon/` (`favicon-16.png`, `favicon-32.png`, `apple-touch-icon.png`,
      `icon-192.png`, `icon-512.png`), generated from `src/assets/logo128.png`.
- [x] Open Graph / Twitter card image: `public/imgs/og-image.png` (1200×630).
- [x] Web app manifest: `public/manifest.webmanifest`.

## Configuration

- [x] Set the real production URL in `astro.config.mjs` (`site`) and in `src/lib/seo.ts` (`SITE_URL`).
- [x] Update the `Sitemap:` line in `public/robots.txt` with the production domain.
- [x] Fill in `README.md`.
- [x] Extend the `pages` collection schema in `src/content.config.ts` and fill in `src/content/pages/index.json` and
      `src/content/pages/404.json`.

## Code

- [x] Implement the home page (`src/components/pages/IndexPage.astro`).
- [x] Implement the 404 page (`src/components/pages/NotFoundPage.astro`, `noindex`).
- [x] Flesh out the SEO helpers (`src/lib/seo.ts`).

## Deployment

- [ ] Configure `ecosystem.config.cjs`: the server's deploy script fills it in.
- [ ] Point the `cs-stats-extension.jagoba.dev` DNS record to the server and enable HTTPS for the subdomain.

## After deployment (manual SEO)

- [ ] Verify the domain in Google Search Console and in Bing Webmaster Tools.
- [ ] Submit `https://cs-stats-extension.jagoba.dev/sitemap-index.xml` in both.
- [ ] Check the structured data with the Rich Results Test.
- [ ] Validate the Open Graph / Twitter card with a social card debugger.

## Client scripts (when you need them)

There is **no `src/scripts/main.ts` catch-all**. Create a domain module per need
(`src/scripts/animations.ts`, `src/scripts/forms.ts`, ...) and import it from
the component's own `<script>`. See `/astro-implement` for details.

## Icons (when you need them)

`astro-icon` uses `@iconify-json/simple-icons` (browser and GitHub icons) and the local SVGs in `src/icons/`.
For another Iconify set, install its package, e.g. `npm i @iconify-json/bi`, then `<Icon name="bi:github" />`.
