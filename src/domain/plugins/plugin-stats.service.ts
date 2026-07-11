import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { IPluginStatsRepository } from "./plugin-stats.repository";

const DOWNLOAD_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

@Injectable()
export class PluginStatsService {
  constructor(
    private readonly repository: IPluginStatsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async trackDownload(
    author: string,
    name: string,
    version: string,
    twitchUserId: string,
  ): Promise<{ counted: boolean }> {
    const cooldownKey = `plugin-download-cooldown:${twitchUserId}:${author}/${name}@${version}`;

    if (await this.cacheManager.get(cooldownKey)) {
      return { counted: false };
    }

    await this.repository.incrementDownload(author, name, version);
    await this.cacheManager.set(cooldownKey, true, DOWNLOAD_COOLDOWN_MS);
    return { counted: true };
  }

  async getDownloadTotals(): Promise<Map<string, number>> {
    const totals = await this.repository.getAllTotals();
    return new Map(totals.map((t) => [`${t.author}/${t.name}`, t.downloads]));
  }
}
