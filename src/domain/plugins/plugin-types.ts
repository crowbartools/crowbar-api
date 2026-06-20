import type { ManagedPluginManifest } from "@crowbartools/firebot-types";

export type PluginVersionWithManifest = {
    version: string;
    manifest: ManagedPluginManifest;
};

export type CachedPlugin = {
    author: string;
    name: string;
    versions: Array<PluginVersionWithManifest>;
}