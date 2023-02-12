export abstract class ICacheService<V = any> {
  constructor() {}

  abstract set(key: string, value: V, ttl?: number): Promise<boolean>;

  abstract get(key: string): Promise<V | undefined>;
}
