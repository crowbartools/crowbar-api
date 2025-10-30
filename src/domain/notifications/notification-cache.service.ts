import { Injectable } from "@nestjs/common";
import { ICacheService } from "../cache/cache-service.interface";

const NOTIFICATION_SOURCE_URLS: Record<string, string> = {
  v5: "https://raw.githubusercontent.com/crowbartools/Firebot/metadata/notifications/notifications.json"
}

@Injectable()
export class NotificationCacheService {
  constructor(private readonly cache: ICacheService<string>) {}

  async refreshCache(): Promise<void> {
    for (const version of Object.keys(NOTIFICATION_SOURCE_URLS)) {
        const notifications = await (await fetch(NOTIFICATION_SOURCE_URLS[version])).text();
        await this.cache.set(version, notifications);
    }
  }

  async getData(version: string): Promise<string | undefined> {
    let notifications = await this.cache.get(version);
    if (!notifications && NOTIFICATION_SOURCE_URLS[version]) {
      notifications = await (await fetch(NOTIFICATION_SOURCE_URLS[version])).text();
      await this.cache.set(version, notifications);
    }
    return notifications ?? "[]";
  }
}