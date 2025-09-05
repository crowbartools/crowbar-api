import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { gzip, ungzip } from "node-gzip";
import { ICacheService } from "src/domain/cache/cache-service.interface";

@Injectable()
export class CompressedCacheService extends ICacheService<string> {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  async set(key: string, value: string, ttl?: number) {
    const compressedValue = await gzip(value ?? "");
    await this.cacheManager.set(key, compressedValue, ttl);
    return value;
  }

  async get(key: string) {
    const compressedValue = await this.cacheManager.get<Buffer>(key);
    if (compressedValue) {
      const decompressedValue = await ungzip(compressedValue);
      return decompressedValue.toString();
    }
    return undefined;
  }
}
