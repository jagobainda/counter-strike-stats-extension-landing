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
