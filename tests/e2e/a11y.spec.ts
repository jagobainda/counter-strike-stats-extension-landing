import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { gotoReady, VIEWPORTS } from "./fixtures";

const AXE_VIEWPORTS = [VIEWPORTS[0], { width: 667, height: 375 }, VIEWPORTS[VIEWPORTS.length - 1]];

for (const path of ["/", "/404.html"]) {
    for (const viewport of AXE_VIEWPORTS) {
        test(`${path} has no axe violations at ${viewport.width}x${viewport.height}`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await gotoReady(page, path);
            const { violations } = await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
                .analyze();
            expect(violations.map(({ id, nodes }) => ({ id, targets: nodes.map(node => node.target) }))).toEqual([]);
        });
    }
}

test("Tab reaches every link in document order with a visible focus indicator", async ({ page, browserName }) => {
    test.skip(
        browserName === "webkit" && process.platform === "win32",
        "Playwright WebKit on Windows does not move focus to links with Tab",
    );
    const tabKey = browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab";
    await gotoReady(page);

    const count = await page.locator("a[href]").count();
    expect(count).toBeGreaterThan(0);
    for (let index = 0; index < count; index++) {
        await page.keyboard.press(tabKey);
        const focus = await page.evaluate(() => {
            const el = document.activeElement!;
            const style = getComputedStyle(el);
            return {
                index: [...document.querySelectorAll("a[href]")].indexOf(el),
                visible:
                    (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
            };
        });
        expect(focus).toEqual({ index, visible: true });
    }
});
