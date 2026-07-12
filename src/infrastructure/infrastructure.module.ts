import { forwardRef, Module, Provider, Scope } from "@nestjs/common";
import { ICacheService } from "../domain/cache/cache-service.interface";
import { IPluginStatsRepository } from "../domain/plugins/plugin-stats.repository";
import { DomainModule } from "../domain/domain.module";
import { CompressedCacheService } from "./cache/compressed-cache.service";
import { DatabaseService } from "./database/database.service";
import { PluginStatsRepository } from "./database/plugin-stats.repository";

const providers: Provider[] = [
  {
    provide: ICacheService,
    useClass: CompressedCacheService,
  },
  DatabaseService,
  {
    provide: IPluginStatsRepository,
    useClass: PluginStatsRepository,
  },
];

@Module({
  imports: [forwardRef(() => DomainModule)],
  providers: [...providers],
  exports: providers,
})
export class InfrastructureModule {}
