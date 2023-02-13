export abstract class ICacheService<V = unknown> {
  constructor() {}

  abstract set(key: string, value: V, ttl?: number): Promise<boolean>;

  abstract get(key: string): Promise<V | undefined>;
}
