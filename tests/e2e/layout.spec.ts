import { expect, test } from "@playwright/test";
import { gotoReady, VIEWPORTS } from "./fixtures";

const TOLERANCE = 1;

for (const viewport of VIEWPORTS) {
    test(`fits ${viewport.width}x${viewport.height} without scroll, overflow or overlap`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await gotoReady(page);

        const required = [
            page.locator("h1"),
            page.getByTestId("subtitle"),
            page.getByTestId("install-chrome"),
            page.getByTestId("install-firefox"),
        ];
        if (viewport.width >= 1024 && viewport.height >= 720) required.push(page.getByTestId("screenshot"));
        for (const locator of required) await expect(locator).toBeVisible();

        const issues = await page.evaluate(tolerance => {
            const { innerWidth: vw, innerHeight: vh } = window;
            const name = (el: Element) =>
                `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}[${el.getAttribute("data-testid") ?? el.getAttribute("class") ?? ""}]`;
            const found: string[] = [];

            for (const el of [document.documentElement, document.body]) {
                if (el.scrollHeight > vh + tolerance) found.push(`${name(el)} scrollHeight ${el.scrollHeight} > ${vh}`);
                if (el.scrollWidth > vw + tolerance) found.push(`${name(el)} scrollWidth ${el.scrollWidth} > ${vw}`);
            }

            for (const el of document.body.querySelectorAll("*")) {
                const box = el.getBoundingClientRect();
                const visible =
                    box.width > 0 &&
                    box.height > 0 &&
                    el.checkVisibility({ opacityProperty: true, visibilityProperty: true });
                if (!visible) continue;

                if (
                    box.left < -tolerance ||
                    box.top < -tolerance ||
                    box.right > vw + tolerance ||
                    box.bottom > vh + tolerance
                )
                    found.push(`${name(el)} outside viewport: ${JSON.stringify(box.toJSON())}`);

                const hasContent =
                    el.matches("a, img") ||
                    [...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
                if (!hasContent || getComputedStyle(el).pointerEvents === "none") continue;

                for (const rect of el.getClientRects()) {
                    const inset = Math.min(2, rect.width / 4, rect.height / 4);
                    const points = [
                        [rect.left + rect.width / 2, rect.top + rect.height / 2],
                        [rect.left + inset, rect.top + inset],
                        [rect.right - inset, rect.top + inset],
                        [rect.left + inset, rect.bottom - inset],
                        [rect.right - inset, rect.bottom - inset],
                    ];
                    const covered = points.find(([x, y]) => {
                        const hit = document.elementFromPoint(x, y);
                        return !hit || !el.contains(hit);
                    });
                    if (covered) {
                        const hit = document.elementFromPoint(covered[0], covered[1]);
                        found.push(`${name(el)} covered at ${covered} by ${hit ? name(hit) : "nothing"}`);
                    }
                }
            }
            return found;
        }, TOLERANCE);

        expect(issues).toEqual([]);
    });
}
