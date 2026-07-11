import type { ManagedPluginManifest, ManifestFirebotVersion } from "@crowbartools/firebot-types";

export const PLUGIN_CATEGORIES = [
    "chat-commands",
    "alerts-events",
    "overlay-widgets",
    "integrations",
    "games-fun",
    "effects-variables",
    "utilities",
] as const;
export type PluginCategory = (typeof PLUGIN_CATEGORIES)[number];

export const PLUGIN_SEARCH_SORT_MODES = ["popular", "recently-updated", "name"] as const;
export type PluginSearchSortMode = (typeof PLUGIN_SEARCH_SORT_MODES)[number];

// TODO: remove once @crowbartools/firebot-types ships `categories` on ManagedPluginManifest
export type CategorizedPluginManifest = ManagedPluginManifest & { categories?: PluginCategory[] };

export type PluginSearchOptions = {
    query?: string;
    category?: PluginCategory;
    sortBy: PluginSearchSortMode;
    page: number;
    pageSize: number;
    firebotVersion: ManifestFirebotVersion;
};

export type PluginVersionWithManifest = {
    version: string;
    manifest: ManagedPluginManifest;
};

export type CachedPlugin = {
    author: string;
    name: string;
    versions: Array<PluginVersionWithManifest>;
}