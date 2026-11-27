import { expect, test } from "@playwright/test";
import { AUTHOR, CANONICAL, content, localPath, pngSize, REPO, SITE, STORES } from "./fixtures";

const TITLE = "Counter-Strike Stats – CS2 Stats on Steam Profiles";
const DESCRIPTION =
    "Free browser extension that displays Counter-Strike stats directly on Steam profiles: csstats.gg Premier seasons, FACEIT and Leetify stats for CS2 and CS:GO.";
const THEME_COLOR = /^#e4e4e1$/i;
const STORE_URLS = Object.values(STORES).sort();

test.describe("home", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("/");
    });

    test("has exact title, description and indexing metadata", async ({ page }) => {
        expect(TITLE.length).toBeLessThanOrEqual(60);
        expect(DESCRIPTION.length).toBeGreaterThanOrEqual(120);
        expect(DESCRIPTION.length).toBeLessThanOrEqual(160);
        await expect(page).toHaveTitle(TITLE);

        const head = page.locator("head");
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
        await expect(head.locator("meta[charset]")).toHaveAttribute("charset", /^utf-8$/i);
        await expect(head.locator('meta[name="viewport"]')).toHaveAttribute("content", /width=device-width/);
        await expect(head.locator('meta[name="theme-color"]')).toHaveAttribute("content", THEME_COLOR);
        await expect(head.locator('meta[name="description"]')).toHaveAttribute("content", DESCRIPTION);
        await expect(head.locator('link[rel="canonical"]')).toHaveAttribute("href", CANONICAL);
        await expect(head.locator('meta[name="robots"]')).toHaveAttribute(
            "content",
            "index, follow, max-image-preview:large",
        );
    });

    test("has complete Open Graph and Twitter tags", async ({ page }) => {
        const ogImage = `${SITE}/imgs/og-image.png`;
        const expected: Record<string, string | RegExp> = {
            'meta[property="og:type"]': "website",
            'meta[property="og:site_name"]': content.heading,
            'meta[property="og:title"]': TITLE,
            'meta[property="og:description"]': DESCRIPTION,
            'meta[property="og:url"]': CANONICAL,
            'meta[property="og:image"]': ogImage,
            'meta[property="og:image:width"]': "1200",
            'meta[property="og:image:height"]': "630",
            'meta[property="og:image:alt"]': /\S/,
            'meta[property="og:locale"]': "en_US",
            'meta[name="twitter:card"]': "summary_large_image",
            'meta[name="twitter:title"]': TITLE,
            'meta[name="twitter:description"]': DESCRIPTION,
            'meta[name="twitter:image"]': ogImage,
            'meta[name="twitter:image:alt"]': /\S/,
        };
        for (const [selector, value] of Object.entries(expected))
            await expect(page.locator(`head ${selector}`), selector).toHaveAttribute("content", value);
    });

    test("serves a 1200x630 PNG Open Graph image", async ({ page, request }) => {
        const url = await page.locator('meta[property="og:image"]').getAttribute("content");
        expect(await pngSize(request, localPath(url!))).toEqual({ width: 1200, height: 630 });
    });

    test("links favicons and manifest that exist with the declared sizes", async ({ page, request }) => {
        for (const size of [16, 32]) {
            const icon = page.locator(`link[rel="icon"][sizes="${size}x${size}"]`);
            await expect(icon).toHaveAttribute("type", "image/png");
            expect(await pngSize(request, (await icon.getAttribute("href"))!)).toEqual({ width: size, height: size });
        }
        const appleHref = await page.locator('link[rel="apple-touch-icon"]').getAttribute("href");
        expect(await pngSize(request, appleHref!)).toEqual({ width: 180, height: 180 });

        const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
        const response = await request.get(manifestHref!);
        expect(response.status()).toBe(200);
        const manifest = await response.json();
        expect(manifest).toMatchObject({
            name: content.heading,
            short_name: "CS Stats",
            start_url: "/",
            display: "standalone",
            background_color: expect.stringMatching(THEME_COLOR),
            theme_color: expect.stringMatching(THEME_COLOR),
        });
        for (const size of [192, 512]) {
            const icon = manifest.icons.find((i: { sizes: string }) => i.sizes === `${size}x${size}`);
            expect(icon, `manifest icon ${size}`).toMatchObject({ type: "image/png" });
            expect(await pngSize(request, new URL(icon.src, response.url()).pathname)).toEqual({
                width: size,
                height: size,
            });
        }
    });

    test("has a single h1 and descriptive alt on every image", async ({ page }) => {
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(page.locator("h1")).toHaveText(content.heading);
        for (const landmark of ["header", "main", "footer"]) await expect(page.locator(landmark)).toHaveCount(1);
        await expect(page.locator('img:not([alt]), img[alt=""]:not([aria-hidden="true"])')).toHaveCount(0);
    });

    test("optimises the hero screenshot for LCP", async ({ page }) => {
        const img = page.getByTestId("screenshot").locator("img");
        await expect(img).toHaveAttribute("fetchpriority", "high");
        await expect(img).toHaveAttribute("loading", "eager");
        await expect(img).toHaveAttribute("width", /^\d+$/);
        await expect(img).toHaveAttribute("height", /^\d+$/);
        await expect(img).toHaveAttribute("src", /\.(avif|webp)(\?|$)/);
        await expect(img).toHaveAttribute("alt", content.screenshot.alt);
    });

    test("describes the extension with valid JSON-LD", async ({ page, request }) => {
        const scripts = page.locator('script[type="application/ld+json"]');
        await expect(scripts).toHaveCount(1);
        const raw = (await scripts.textContent())!;
        expect(raw).not.toMatch(
            /"(aggregateRating|reviews?|ratingValue|interactionStatistic|userInteractionCount)"\s*:/,
        );

        const data = JSON.parse(raw);
        expect(data["@context"]).toMatch(/^https?:\/\/schema\.org\/?$/);
        const byType = (type: string) => data["@graph"].find((node: { "@type": string }) => node["@type"] === type);

        const website = byType("WebSite");
        expect(website.name).toBe(content.heading);
        expect([SITE, CANONICAL]).toContain(website.url);

        const app = byType("SoftwareApplication");
        const person = { "@type": "Person", name: "Jagoba", url: AUTHOR };
        expect(app).toMatchObject({
            name: content.heading,
            description: expect.stringMatching(/\S/),
            applicationCategory: "BrowserApplication",
            operatingSystem: "Chrome, Firefox",
            offers: { "@type": "Offer", priceCurrency: "USD" },
            softwareVersion: "3.0.0",
            license: "https://opensource.org/licenses/MIT",
            isAccessibleForFree: true,
            author: person,
            publisher: person,
        });
        expect(String(app.offers.price)).toBe("0");
        expect([...app.downloadUrl].sort()).toEqual(STORE_URLS);
        expect([...app.installUrl].sort()).toEqual(STORE_URLS);
        expect([...app.sameAs].sort()).toEqual([...STORE_URLS, REPO].sort());

        for (const url of [app.image, ...[app.screenshot].flat()]) {
            const response = await request.get(localPath(url));
            expect(response.status(), url).toBe(200);
            expect(response.headers()["content-type"], url).toMatch(/^image\//);
        }
    });
});

test("robots.txt allows everything and points to the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const lines = (await response.text()).split(/\r?\n/).map(line => line.trim());
    expect(lines).toEqual(expect.arrayContaining(["User-agent: *", "Allow: /", `Sitemap: ${SITE}/sitemap-index.xml`]));
});

test("sitemap lists only the canonical home URL", async ({ request }) => {
    const locs = async (path: string) => {
        const response = await request.get(path);
        expect(response.status(), path).toBe(200);
        return [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
    };
    const children = await locs("/sitemap-index.xml");
    expect(children.length).toBeGreaterThan(0);
    const pages = (await Promise.all(children.map(child => locs(localPath(child))))).flat();
    expect(pages).toEqual([CANONICAL]);
});

for (const path of ["/404.html", "/this-page-does-not-exist"]) {
    test(`${path} is a noindex 404 page`, async ({ page }) => {
        const response = await page.goto(path);
        if (path !== "/404.html") expect(response?.status()).toBe(404);
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    });
}
