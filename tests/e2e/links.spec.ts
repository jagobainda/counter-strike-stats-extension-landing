import { expect, test, type Locator } from "@playwright/test";
import { AUTHOR, content, REPO, STORES } from "./fixtures";

async function expectExternal(link: Locator, href: string) {
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
}

test.beforeEach(async ({ page }) => {
    await page.goto("/");
});

test("install buttons point to the exact store pages", async ({ page }) => {
    await expect(page.locator('[data-testid^="install-"]')).toHaveCount(Object.keys(STORES).length);
    for (const [browser, href] of Object.entries(STORES)) {
        const link = page.getByTestId(`install-${browser}`);
        await expectExternal(link, href);
        await expect(link).toHaveAccessibleName(new RegExp(`Add to ${browser}`, "i"));
    }
});

test("footer links to the source code and the author", async ({ page }) => {
    const footer = page.locator("footer");
    const source = footer.getByRole("link", { name: "Open source on GitHub" });
    await expectExternal(source, REPO);
    await expect(source).toHaveText(content.footer.source.label);
    await expectExternal(footer.getByRole("link", { name: content.footer.author.label }), AUTHOR);
});

const CHROMIUM_FORKS = {
    brave: { brave: {} },
    edge: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Edg/131.0.0.0" },
    opera: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 OPR/116.0.0.0" },
    operagx: { userAgentData: { brands: [{ brand: "Chromium" }, { brand: "Opera GX" }] } },
};

for (const { browser, label } of content.install[0].variants) {
    test(`relabels the Chrome button in ${browser}`, async ({ page }) => {
        await page.addInitScript(
            props => {
                for (const [key, value] of Object.entries(props)) Object.defineProperty(navigator, key, { value });
            },
            CHROMIUM_FORKS[browser as keyof typeof CHROMIUM_FORKS],
        );
        await page.goto("/");
        const link = page.getByTestId("install-chrome");
        await expect(link).toHaveAccessibleName(label);
        await expect(link.locator("svg[data-icon]")).not.toHaveAttribute("data-icon", /googlechrome/);
        await expectExternal(link, STORES.chrome);
        await expect(page.getByTestId("install-firefox")).toHaveAccessibleName("Add to Firefox");
    });
}
