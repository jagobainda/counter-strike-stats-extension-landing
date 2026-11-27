import type { CollectionEntry } from "astro:content";

export type PageData = CollectionEntry<"pages">["data"];

const HOME_FIELDS = ["subtitle", "sources", "install", "screenshot", "features", "footer"] as const;

export type HomeData = PageData & Required<Pick<PageData, (typeof HOME_FIELDS)[number]>>;

export const isHomeData = (data: PageData): data is HomeData => HOME_FIELDS.every(field => data[field] !== undefined);
