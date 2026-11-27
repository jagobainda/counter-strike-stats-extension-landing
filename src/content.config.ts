import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const link = z.object({ label: z.string(), href: z.string().url() });

const pages = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/pages" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        heading: z.string(),
        noindex: z.boolean().default(false),
        subtitle: z.string().optional(),
        sources: z.string().optional(),
        install: z
            .array(
                link.extend({
                    browser: z.enum(["chrome", "firefox"]),
                    variants: z
                        .array(z.object({ browser: z.enum(["brave", "edge", "opera", "operagx"]), label: z.string() }))
                        .optional(),
                }),
            )
            .optional(),
        screenshot: z.object({ alt: z.string(), caption: z.string() }).optional(),
        features: z.array(z.object({ name: z.string(), text: z.string() })).optional(),
        footer: z.object({ source: link, authorPrefix: z.string(), author: link, disclaimer: z.string() }).optional(),
        labels: z.record(z.string(), z.string()).default({}),
    }),
});

export const collections = { pages };
