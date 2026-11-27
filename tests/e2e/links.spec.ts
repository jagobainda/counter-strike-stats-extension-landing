import { expect, test, type Locator, type Page } from "@playwright/test";
import { AUTHOR, content, REPO, STORES } from "./fixtures";

async function expectExternal(link: Locator, href: string) {
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
}

async function stubNavigator(page: Page, props: Record<string, unknown>) {
    await page.addInitScript(props => {
        for (const [key, value] of Object.entries(props)) Object.defineProperty(navigator, key, { value });
    }, props);
}

test("install buttons point to the exact store pages", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-testid^="install-"]')).toHaveCount(Object.keys(STORES).length);
    for (const [browser, href] of Object.entries(STORES)) {
        const link = page.getByTestId(`install-${browser}`);
        await expectExternal(link, href);
        await expect(link).toHaveAccessibleName(new RegExp(`Add to ${browser}`, "i"));
    }
});

test("footer links to the source code and the author", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const source = footer.getByRole("link", { name: "Open source on GitHub" });
    await expectExternal(source, REPO);
    await expect(source).toHaveText(content.footer.source.label);
    await expectExternal(footer.getByRole("link", { name: content.footer.author.label }), AUTHOR);
});

const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0";
const OPERA_UA = `${DESKTOP_UA} OPR/116.0.0.0`;
const CHROMIUM_FORKS = [
    { label: "Add to Brave", icon: "brave", navigator: { brave: {} } },
    { label: "Add to Edge", icon: "microsoftedge", navigator: { userAgent: `${DESKTOP_UA} Edg/131.0.0.0` } },
    { label: "Add to Opera", icon: "opera", navigator: { userAgent: OPERA_UA } },
    {
        label: "Add to Opera GX",
        icon: "operagx",
        navigator: { userAgent: OPERA_UA, userAgentData: { mobile: false, brands: [{ brand: "Opera GX" }] } },
    },
];

for (const fork of CHROMIUM_FORKS) {
    test(`relabels the Chrome button as "${fork.label}"`, async ({ page }) => {
        await stubNavigator(page, fork.navigator);
        await page.goto("/");
        const link = page.getByTestId("install-chrome");
        await expect(link).toHaveAccessibleName(fork.label);
        await expect(link.locator("svg[data-icon]")).toHaveAttribute("data-icon", `simple-icons:${fork.icon}`);
        await expectExternal(link, STORES.chrome);
        await expect(page.getByTestId("install-firefox")).toHaveAccessibleName("Add to Firefox");
    });
}

test("keeps the Chrome label on mobile browsers", async ({ page }) => {
    await stubNavigator(page, { userAgent: "Mozilla/5.0 (Linux; Android 14) Chrome/131.0.0.0 Mobile OPR/86.0.0.0" });
    await page.goto("/");
    await expect(page.getByTestId("install-chrome")).toHaveAccessibleName("Add to Chrome");
});
