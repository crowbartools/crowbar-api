import { Injectable } from "@nestjs/common";
import * as NodeCache from "node-cache";
import { gzip, ungzip } from "node-gzip";
import { ICacheService } from "src/domain/cache/cache-service.interface";

@Injectable()
export class BasicMemoryCacheService extends ICacheService<string> {
  private readonly cache: NodeCache;

  constructor() {
    super();
    this.cache = new NodeCache({ stdTTL: 259200 /* 3 days */ });
  }

  async set(key: string, value: string, ttl?: number) {
    const compressedValue = await gzip(value ?? "");
    return this.cache.set(key, compressedValue, ttl as string | number);
  }

  async get(key: string) {
    const compressedValue = this.cache.get<Buffer>(key);
    if (compressedValue) {
      const decompressedValue = await ungzip(compressedValue);
      return decompressedValue.toString();
    }
    return undefined;
  }
}
