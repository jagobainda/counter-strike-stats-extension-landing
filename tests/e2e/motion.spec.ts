import { expect, test } from "@playwright/test";
import { finalStateIssues, gotoReady } from "./fixtures";

test.describe("with prefers-reduced-motion: reduce", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows the content at once without entrance animations", async ({ page }) => {
        await page.goto("/");
        const state = await page.evaluate(() => ({
            motion: document.documentElement.dataset.motion,
            running: document.getAnimations().filter(animation => animation.playState === "running").length,
        }));
        expect(state).toEqual({ motion: "done", running: 0 });
        expect(await finalStateIssues(page)).toEqual([]);
    });
});

test.describe("without motion preference", () => {
    test.use({ reducedMotion: "no-preference" });

    test("runs the entrance animations and finishes them in their final state", async ({ page }) => {
        await page.addInitScript(() => {
            const states: string[] = [];
            Object.assign(window, { motionStates: states });
            new MutationObserver(() => states.push(document.documentElement.dataset.motion ?? "")).observe(document, {
                attributeFilter: ["data-motion"],
                subtree: true,
            });
        });
        await gotoReady(page);
        expect(await page.evaluate(() => (window as Window & { motionStates?: string[] }).motionStates)).toEqual([
            "run",
            "done",
        ]);
        expect(await finalStateIssues(page)).toEqual([]);
    });
});

test.describe("without JavaScript", () => {
    test.use({ javaScriptEnabled: false });

    test("renders the content in its final state", async ({ page }) => {
        // Not gotoReady: awaiting document.fonts.ready hangs in Firefox when JavaScript is disabled.
        await page.goto("/");
        await expect(page.locator("html")).toHaveAttribute("data-motion", "done");
        expect(await finalStateIssues(page)).toEqual([]);
    });
});
