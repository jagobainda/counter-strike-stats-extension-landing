import { expect, test } from "@playwright/test";
import { gotoReady } from "./fixtures";

test("loads without errors or third-party requests", async ({ page, baseURL }) => {
    const problems: string[] = [];
    page.on("console", message => {
        if (message.type() === "error") problems.push(`console: ${message.text()}`);
    });
    page.on("pageerror", error => problems.push(`pageerror: ${error.message}`));
    page.on("request", request => {
        const url = new URL(request.url());
        if (!["data:", "blob:"].includes(url.protocol) && url.origin !== new URL(baseURL!).origin)
            problems.push(`request: ${request.url()}`);
    });

    await gotoReady(page);
    await page.waitForLoadState("networkidle");
    expect(problems).toEqual([]);
});
