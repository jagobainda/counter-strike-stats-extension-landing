import { expect, type APIRequestContext, type Page } from "@playwright/test";
import content from "../../src/content/pages/index.json" with { type: "json" };

export { content };

export const SITE = "https://cs-stats-extension.jagoba.dev";
export const CANONICAL = `${SITE}/`;
export const STORES = {
    chrome: "https://chromewebstore.google.com/detail/nklafihgaifhoahbfcfiaemfmpoplkch",
    firefox: "https://addons.mozilla.org/firefox/addon/counter-strike-stats/",
};
export const REPO = "https://github.com/jagobainda/CounterStrikeStatsExtension";
export const AUTHOR = "https://jagoba.dev";

export const VIEWPORTS = [
    { width: 320, height: 568 },
    { width: 360, height: 640 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 844, height: 390 },
    { width: 667, height: 375 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
];

export async function gotoReady(page: Page, path = "/") {
    await page.goto(path);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "done");
    await page.evaluate(() => document.fonts.ready);
}

export function localPath(url: string) {
    expect(url.startsWith(`${SITE}/`), url).toBe(true);
    return new URL(url).pathname;
}

export async function pngSize(request: APIRequestContext, path: string) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain("image/png");
    const body = await response.body();
    expect(body.subarray(12, 16).toString("ascii"), path).toBe("IHDR");
    return { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
}

export function finalStateIssues(page: Page) {
    return page.evaluate(() => {
        const identity = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/;
        const elements = [...document.querySelectorAll<HTMLElement>("[data-animate]")];
        if (!elements.length) return ["no [data-animate] elements"];
        return elements.flatMap(el => {
            const style = getComputedStyle(el);
            const residual = [style.transform, style.translate, style.scale, style.rotate].some(v => !identity.test(v));
            return style.opacity === "1" && !residual
                ? []
                : [`${el.outerHTML.slice(0, 80)} opacity=${style.opacity} transform=${style.transform}`];
        });
    });
}
