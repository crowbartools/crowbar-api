import { Injectable } from "@nestjs/common";
import { ICacheService } from "../cache/cache-service.interface";
import { generate } from "rxjs";
import generateCacheKey from "../util/key-generator";

@Injectable()
export class DataBinCacheService {
  constructor(private readonly cache: ICacheService<string>) {}

  async getData(key: string): Promise<string | undefined> {
    return this.cache.get(key);
  }

  async setData(value: string): Promise<{ key: string }> {
    const key = generateCacheKey();
    await this.cache.set(key, value);
    return { key };
  }
}
