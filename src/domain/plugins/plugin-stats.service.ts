import { Injectable } from "@nestjs/common";
import { IPluginStatsRepository } from "./plugin-stats.repository";

const DOWNLOAD_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

@Injectable()
export class PluginStatsService {
  constructor(private readonly repository: IPluginStatsRepository) {}

  private readonly downloadCooldowns = new Map<string, number>();

  async trackDownload(
    author: string,
    name: string,
    twitchUserId: string,
  ): Promise<{ counted: boolean }> {
    const key = `${twitchUserId}:${author}/${name}`;
    const now = Date.now();
    const last = this.downloadCooldowns.get(key);

    if (last != null && now - last < DOWNLOAD_COOLDOWN_MS) {
      return { counted: false };
    }

    await this.repository.incrementDownload(author, name);
    this.downloadCooldowns.set(key, now);
    return { counted: true };
  }
}
