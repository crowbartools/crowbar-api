import { Inject, Injectable } from "@nestjs/common";
import { ICacheService } from "../cache/cache-service.interface";
import { ConfigType } from "@nestjs/config";
import appConfig from "src/infrastructure/config";
import axios, { AxiosResponse } from "axios";
import Fuse from "fuse.js";

type SteamApp = {
  appid: number;
  name: string;
};

type SteamAppListResponse = {
  response: {
    apps: SteamApp[];
    have_more_results?: boolean;
    last_appid?: number;
  };
};

@Injectable()
export class SteamService {
  cachedSteamApps: SteamApp[] | null = null;
  lastAppListFetch: number | null = null;
  isFetchingAppList: boolean = false;

  constructor(
    @Inject(appConfig.KEY)
    private config: ConfigType<typeof appConfig>,
    private readonly cache: ICacheService<string>,
  ) {}

  async findSteamAppIdByName(appName: string): Promise<number | null> {
    if (!appName?.trim()) {
      return null;
    }

    const cacheKey = `steam-app-id:${appName}`;

    const cachedAppId = await this.cache.get(cacheKey);
    if (cachedAppId != null) {
      return Number(cachedAppId);
    }

    const steamApps = await this.getCachedSteamApps();
    if (!steamApps) {
      return null;
    }

    const fuse = new Fuse(steamApps, {
      keys: ["name"],
    });

    const search = fuse.search(appName);

    const matchedAppId = search[0]?.item?.appid;
    if (matchedAppId != null) {
      await this.cache.set(cacheKey, matchedAppId.toString());
    }

    return matchedAppId;
  }

  private cacheSteamApps(steamApps: SteamApp[] | null) {
    if (!steamApps) {
      return null;
    }
    this.lastAppListFetch = Date.now();
    this.cachedSteamApps = steamApps.map((a) => ({
      appid: a.appid,
      name: a.name,
    }));
    return this.cachedSteamApps;
  }

  private async getCachedSteamApps(): Promise<SteamApp[] | null> {
    // if we have cached apps
    if (!!this.cachedSteamApps?.length && this.lastAppListFetch != null) {
      const now = Date.now();
      const lastFetchGreaterThan24HoursAgo =
        now - this.lastAppListFetch >= 24 * 60 * 60 * 1000;
      if (lastFetchGreaterThan24HoursAgo && !this.isFetchingAppList) {
        // fetch in background but return cached apps immediately
        this.fetchSteamAppList().then((steamApps) => {
          this.cacheSteamApps(steamApps);
        });
      }

      return this.cachedSteamApps;
    } else {
      // else fetch apps and cache them
      const steamApps = await this.fetchSteamAppList();
      return this.cacheSteamApps(steamApps);
    }
  }

  private async fetchSteamAppList(
    lastAppId?: number,
    currentApps: SteamApp[] = [],
  ): Promise<SteamApp[] | null> {
    this.isFetchingAppList = true;
    try {
      const response: AxiosResponse<SteamAppListResponse> = await axios.get(
        "https://api.steampowered.com/IStoreService/GetAppList/v1/",
        {
          params: {
            key: this.config.steamWebApiKey,
            max_results: 50000,
            last_appid: lastAppId ?? 0,
          },
        },
      );
      if (response.status === 200) {
        if (
          response.data?.response?.have_more_results &&
          response.data.response.last_appid
        ) {
          return this.fetchSteamAppList(response.data.response.last_appid, [
            ...currentApps,
            ...response.data.response.apps,
          ]);
        } else {
          this.isFetchingAppList = false;
          return [...currentApps, ...response.data.response.apps];
        }
      }
    } catch (error) {}

    this.isFetchingAppList = false;
    return null;
  }
}
