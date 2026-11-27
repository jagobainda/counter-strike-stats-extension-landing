import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

const localFont = (name, cssVariable, src, weight, fallbacks) => ({
    provider: fontProviders.local(),
    name,
    cssVariable,
    fallbacks,
    options: { variants: [{ src: [src], weight, style: "normal" }] },
});

// Astro rendering model (Astro 5+, no more `hybrid`):
//   - `output: "static"` (default): every route is prerendered at build time.
//     Opt a single route INTO on-demand/SSR with `export const prerender = false`.
//   - `output: "server"`: every route is server-rendered; opt a route OUT with
//     `export const prerender = true`.
// We keep "static" so the site is fast by default and only the routes that need
// it become dynamic. The node adapter is what makes those on-demand routes work.
export default defineConfig({
    site: "https://cs-stats-extension.jagoba.dev",
    output: "static",
    trailingSlash: "never",
    build: {
        format: "file",
        inlineStylesheets: "always",
    },
    adapter: node({
        mode: "standalone",
    }),
    fonts: [
        localFont(
            "Audiowide",
            "--font-audiowide",
            "@fontsource/audiowide/files/audiowide-latin-400-normal.woff2",
            400,
            ["sans-serif"],
        ),
        localFont(
            "Inter",
            "--font-inter",
            "@fontsource-variable/inter/files/inter-latin-wght-normal.woff2",
            "100 900",
            ["sans-serif"],
        ),
        localFont(
            "JetBrains Mono",
            "--font-jetbrains-mono",
            "@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
            "100 800",
            ["monospace"],
        ),
    ],
    integrations: [
        icon(),
        sitemap({
            filter: page => !/\/404(\.html)?\/?$/.test(new URL(page).pathname),
        }),
    ],
    vite: {
        plugins: [tailwindcss()],
    },
});
