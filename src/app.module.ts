import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { ApiModule } from "./api/api.module";
import { DomainModule } from "./domain/domain.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { CacheModule } from "@nestjs/cache-manager";
import { Keyv } from "keyv";
import { CacheableMemory } from "cacheable";
import { ConfigModule, ConfigService, ConfigType } from "@nestjs/config";
import appConfig from "./infrastructure/config";

const ENV = process.env.NODE_ENV || "development";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      ignoreEnvFile: ENV !== "development",
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        await ConfigModule.envVariablesLoaded;
        const rateLimitTtl = configService.get<number>("app.rateLimitTtl");
        const rateLimitMax = configService.get<number>("app.rateLimitMax");
        return {
          throttlers: [
            {
              ttl: rateLimitTtl!,
              limit: rateLimitMax!,
            },
          ],
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        await ConfigModule.envVariablesLoaded;
        const cacheTtl = configService.get<number>("app.cacheTtl");
        const cacheLruSize = configService.get<number>("app.cacheLruSize");
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({
                ttl: cacheTtl,
                lruSize: cacheLruSize,
              }),
            }),
          ],
        };
      },
    }),
    DomainModule,
    InfrastructureModule,
    ApiModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
