import type { CommunityPluginManifest, ManifestFirebotVersion } from "@crowbartools/firebot-types";

export const PLUGIN_CATEGORIES = [
    "stream-services",
    "social",
    "music-media",
    "games",
    "overlays",
    "tools-utilities",
] as const;
export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

export const PLUGIN_FEATURES = [
    "effects",
    "events",
    "variables",
    "integrations",
    "overlay-widgets",
    "games",
    "commands",
    "ui-extensions",
] as const;
export type PluginFeature = (typeof PLUGIN_FEATURES)[number];

export const PLUGIN_SEARCH_SORT_MODES = ["popular", "recently-updated", "name"] as const;
export type PluginSearchSortMode = (typeof PLUGIN_SEARCH_SORT_MODES)[number];

export const OFFICIAL_PLUGIN_GITHUB_ORGS = [
    "crowbartools",
    "ebiggz",
    "zunderscore",
    "sreject",
    "heyaapl",
    "cavemobster",
    "itsjesski",
    "brumoen",
] as const;


export type PluginSearchOptions = {
    query?: string;
    category?: PluginCategory;
    features?: PluginFeature[];
    official?: boolean;
    sortBy: PluginSearchSortMode;
    page: number;
    pageSize: number;
    firebotVersion: ManifestFirebotVersion;
};

export type PluginVersionWithManifest = {
    version: string;
    manifest: CommunityPluginManifest;
};

export type CachedPlugin = {
    author: string;
    name: string;
    versions: Array<PluginVersionWithManifest>;
}