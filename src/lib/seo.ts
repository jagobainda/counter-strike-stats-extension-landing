import type { HomeData } from "./types";

export const SITE_URL = "https://cs-stats-extension.jagoba.dev";
export const SITE_NAME = "Counter-Strike Stats";
export const THEME_COLOR = "#E4E4E1";
export const OG_IMAGE = { path: "/imgs/og-image.png", width: 1200, height: 630 };

const APP_ICON = "/imgs/favicon/icon-512.png";
const APP_VERSION = "3.0.0";

export const absoluteUrl = (path: string) => new URL(path, SITE_URL).href;

// Escapes "<" so no string in the data can close the inline <script>.
export const jsonLdHtml = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");

export function homeGraph(page: HomeData, screenshotPaths: string[]) {
    const stores = page.install.map(store => store.href);
    const author = { "@type": "Person", name: page.footer.author.label, url: page.footer.author.href };

    return {
        "@context": "https://schema.org",
        "@graph": [
            { "@type": "WebSite", name: SITE_NAME, url: absoluteUrl("/") },
            {
                "@type": "SoftwareApplication",
                name: page.heading,
                description: page.description,
                applicationCategory: "BrowserApplication",
                operatingSystem: "Chrome, Firefox",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                downloadUrl: stores,
                installUrl: stores,
                softwareVersion: APP_VERSION,
                image: absoluteUrl(APP_ICON),
                screenshot: screenshotPaths.map(absoluteUrl),
                license: "https://opensource.org/licenses/MIT",
                isAccessibleForFree: true,
                author,
                publisher: author,
                sameAs: [...stores, page.footer.source.href],
            },
        ],
    };
}
