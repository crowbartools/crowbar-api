import { Injectable } from "@nestjs/common";
import { ICacheService } from "../cache/cache-service.interface";

@Injectable()
export class ProfileDataCacheService {
  constructor(private readonly cache: ICacheService<string>) {}

  async save(channelName: string, profileData: unknown) {
    const profileJson = JSON.stringify(profileData);
    return this.cache.set(channelName.toLocaleLowerCase(), profileJson);
  }

  async get(channelName: string) {
    const profileJson = await this.cache.get(channelName.toLocaleLowerCase());
    return profileJson ? JSON.parse(profileJson) : undefined;
  }
}
