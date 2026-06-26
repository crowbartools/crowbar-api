import type {
    ManagedPluginManifest,
    ManagedPluginWithManifest,
    ManagedPluginUpdateRequest,
    ManifestFirebotVersion,
} from "@crowbartools/firebot-types";
import type {
    CachedPlugin,
    PluginVersionWithManifest,
} from "./plugin-types";
import { Octokit } from "@octokit/rest";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import tar from "tar-stream";
import Fuse from "fuse.js";
import { Injectable } from "@nestjs/common";
import { ICacheService } from "../cache/cache-service.interface";
import { createGunzip } from "node:zlib";
import sortVersionStrings from "../util/sort-versions";

const PLUGIN_MANIFEST_OWNER = "crowbartools";
const PLUGIN_MANIFEST_REPO = "firebot-plugins";
const PLUGIN_MANIFEST_BRANCH = "main";
const PLUGIN_CACHE_REFRESH_INTERVAL = 5 * 60 * 1000; // Every 5 minutes

// Tarball has files inside a root folder with repo name/SHA
const PLUGIN_MANIFEST_TARBALL_FILENAME_REGEX = /^(.*)\/manifests\/(.*)\/(.*)\/(.*)\/manifest.json$/i
const PLUGIN_MANIFEST_FILENAME_REGEX = /^manifests\/(.*)\/(.*)\/(.*)\/manifest.json$/i

@Injectable()
export class PluginCacheService {
    constructor(private readonly cache: ICacheService<CachedPlugin[]>) { }

    private _octokit = new Octokit();
    private _latestHash = "";
    private _refreshTimeout: NodeJS.Timeout | undefined;

    async loadCache(): Promise<void> {
        if (!this._latestHash.length) {
            try {
                // Get repo info
                const repo = await this._octokit.repos.getBranch({
                    owner: PLUGIN_MANIFEST_OWNER,
                    repo: PLUGIN_MANIFEST_REPO,
                    branch: PLUGIN_MANIFEST_BRANCH
                });

                // Pull tarball
                const tarballFetchResponse = await fetch(`https://api.github.com/repos/${PLUGIN_MANIFEST_OWNER}/${PLUGIN_MANIFEST_REPO}/tarball/${PLUGIN_MANIFEST_BRANCH}`);

                // Extract
                const extract = tar.extract();
                Readable.fromWeb(tarballFetchResponse.body!).pipe(createGunzip()).pipe(extract);

                // Iterate through manifests and add to cache
                const pluginCache: CachedPlugin[] = [];

                for await (const entry of extract) {
                    if (entry.header.type === "file" && PLUGIN_MANIFEST_TARBALL_FILENAME_REGEX.test(entry.header.name)) {
                        // Plugin manifests in the tarball are in the format:
                        // owner-repo-sha/manifests/{author}/{pluginName}/{pluginVersion}/manifest.json
                        const [_, __, author, pluginName, pluginVersion] = entry.header.name.split("/");
                        let manifestContentsRaw = "";

                        entry.on("data", (chunk) => {
                            manifestContentsRaw += chunk;
                        });
                        await finished(entry);

                        const manifest = JSON.parse(manifestContentsRaw) as ManagedPluginManifest;

                        const existingEntry = pluginCache.find(p => p.author === author && p.name === pluginName);

                        if (existingEntry) {
                            existingEntry.versions.push({
                                version: pluginVersion,
                                manifest
                            });
                        } else {
                            pluginCache.push({
                                author,
                                name: pluginName,
                                versions: [{
                                    version: pluginVersion,
                                    manifest
                                }]
                            });
                        }
                    }
                }

                // Save to the cache
                await this.cache.set("plugin-cache", pluginCache);

                // Mark this commit as the latest we've checked
                this._latestHash = repo.data.commit.sha;

                // And start the refresh loop
                if (this._refreshTimeout) {
                    clearInterval(this._refreshTimeout);
                }

                this._refreshTimeout = setInterval(async () => await this.refreshCache(), PLUGIN_CACHE_REFRESH_INTERVAL);
            } catch { }
        }
    }

    async refreshCache(forceRefresh = false): Promise<void> {
        if (forceRefresh === true || !this._latestHash.length) {
            await this.loadCache();
        } else {
            try {
                // Get repo info
                const repo = await this._octokit.repos.getBranch({
                    owner: PLUGIN_MANIFEST_OWNER,
                    repo: PLUGIN_MANIFEST_REPO,
                    branch: PLUGIN_MANIFEST_BRANCH
                });

                if (this._latestHash === repo.data.commit.sha) {
                    // No changes, so dip out
                    return;
                }

                // Load the cache
                const pluginCache = await this.cache.get("plugin-cache") ?? [];

                // Get diff between our latest and repo latest
                const changes = await this._octokit.repos.compareCommits({
                    owner: PLUGIN_MANIFEST_OWNER,
                    repo: PLUGIN_MANIFEST_REPO,
                    base: this._latestHash,
                    head: repo.data.commit.sha
                });

                // Check each file in the changes
                for (const file of changes.data.files ?? []) {
                    // We're only looking for additions to manifests
                    if (file.additions > 0 && PLUGIN_MANIFEST_FILENAME_REGEX.test(file.filename)) {
                        // Plugin manifests in diffs are in the format:
                        // manifests/{author}/{pluginName}/{pluginVersion}/manifest.json
                        const [_, author, pluginName, pluginVersion] = file.filename.split("/");

                        // Grab the manifest file from GH
                        const rawUrl = `https://raw.githubusercontent.com/${PLUGIN_MANIFEST_OWNER}/${PLUGIN_MANIFEST_REPO}/${PLUGIN_MANIFEST_BRANCH}/${file.filename}`;
                        const manifest = await (await fetch(rawUrl)).json() as ManagedPluginManifest;

                        // Update cache with new manifest data
                        const existingPlugin = pluginCache.find(p =>
                            p.author === author
                            && p.name === pluginName
                        );

                        if (existingPlugin) {
                            existingPlugin.versions.push({
                                version: pluginVersion,
                                manifest
                            });
                        } else {
                            pluginCache.push({
                                author,
                                name: pluginName,
                                versions: [{
                                    version: pluginVersion,
                                    manifest
                                }]
                            });
                        }
                    }
                }

                // Save updated cache
                await this.cache.set("plugin-cache", pluginCache);

                // Update latest hash with this commit
                this._latestHash = repo.data.commit.sha;
            } catch { }
        }
    }

    private meetsFirebotVersionRequirement(
        current: ManifestFirebotVersion,
        min?: ManifestFirebotVersion,
        max?: ManifestFirebotVersion
    ): boolean {
        // No limits, all good
        if (min == null && max == null) {
            return true;
        }

        if (min != null) {
            if (current.major < min.major) {
                return false;
            }

            if (current.major === min.major) {
                if (min.minor != null && (current.minor ?? 0) < min.minor) {
                    return false;
                }

                if (min.minor != null && (current.minor ?? 0) === min.minor) {
                    if (min.patch != null && (current.patch ?? 0) < min.patch) {
                        return false;
                    }
                }
            }
        }

        if (max != null) {
            if (current.major > max.major) {
                return false;
            }

            if (current.major === max.major) {
                if (max.minor != null && (current.minor ?? 0) > max.minor) {
                    return false;
                }

                if (max.minor != null && (current.minor ?? 0) === max.minor) {
                    if (max.patch != null && (current.patch ?? 0) > max.patch) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private getLatestCompatiblePluginVersion(
        pluginVersions: Array<PluginVersionWithManifest>,
        firebotVersion: ManifestFirebotVersion
    ): { version: string, manifest: ManagedPluginManifest } | null {
        const sortedVersionList = pluginVersions
            // Sort them in reverse so we get latest one first
            .toSorted((a, b) => sortVersionStrings(b.version, a.version));

        for (const pluginVersion of sortedVersionList) {
            if (this.meetsFirebotVersionRequirement(
                firebotVersion,
                pluginVersion.manifest.minimumFirebotVersion,
                pluginVersion.manifest.maximumFirebotVersion
            )) {
                return pluginVersion;
            }
        }

        return null;
    }

    async searchPlugins(query: string, firebotVersion: ManifestFirebotVersion): Promise<ManagedPluginWithManifest[]> {
        // Load the cache if it hasn't been already
        await this.loadCache();

        const pluginCache = await this.cache.get("plugin-cache") ?? [];
        const availablePlugins = pluginCache.map(r => {
            const latest = this.getLatestCompatiblePluginVersion(r.versions, firebotVersion);
            return latest != null
                ? {
                    author: r.author,
                    name: r.name,
                    version: latest.version,
                    manifest: latest.manifest
                } as ManagedPluginWithManifest
                : null;
        }).filter(r => r != null)

        const fuse = new Fuse(availablePlugins ?? [], {
            keys: [
                "author",
                "pluginName",
                "manifest.name",
                "manifest.author",
                "manifest.description",
                "manifest.tags"
            ],
            threshold: 0.3 // We still want fuzzy, but pretty close
        });
        const results = fuse.search(query).map(r => r.item) ?? [];

        return results;
    }

    private isLatestVersionNewer(latestVersion: string, currentVersion: string): boolean {
        // If they're the same, it's not newer. It's the same.
        if (latestVersion === currentVersion) {
            return false;
        }

        // This is stupid, but it works. We put the versions in an array, sort it in reverse,
        // and if the latest version is first, it's newer.
        const newerVersion = [latestVersion, currentVersion]
            .sort((a, b) => sortVersionStrings(b, a))[0];

        if (currentVersion === newerVersion) {
            return false;
        }

        return true;
    }

    async checkPluginsForUpdates(request: ManagedPluginUpdateRequest): Promise<ManagedPluginWithManifest[]> {
        // Load the cache if it hasn't been already
        await this.loadCache();

        const pluginCache = await this.cache.get("plugin-cache") ?? [];
        const availableUpdates: ManagedPluginWithManifest[] = [];

        for (const currentPlugin of request.plugins) {
            const plugin = pluginCache.find(p => p.author === currentPlugin.author && p.name === currentPlugin.name);
            if (plugin) {
                const latestVersion = this.getLatestCompatiblePluginVersion(
                    plugin.versions,
                    request.firebotVersion
                );

                if (latestVersion && this.isLatestVersionNewer(latestVersion.version, currentPlugin.version)) {
                    availableUpdates.push({
                        author: currentPlugin.author,
                        name: currentPlugin.name,
                        version: latestVersion.version,
                        manifest: latestVersion.manifest
                    });
                }
            }
        }

        return availableUpdates;
    }
}
