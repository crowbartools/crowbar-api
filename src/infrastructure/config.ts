import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT!, 10) || 3000,
  rateLimitTtl: parseInt(process.env.RATE_LIMIT_TTL!, 10) || 60000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX!, 10) || 10,
  maxRequestBodySize: process.env.MAX_BODY_SIZE || "1mb",
  cacheTtl: process.env.CACHE_TTL || "1d",
  cacheLruSize: parseInt(process.env.CACHE_LRU_SIZE!, 10) || 2500,
  twitchClientId: process.env.TWITCH_CLIENT_ID || "",
}));
