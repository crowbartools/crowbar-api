import { forwardRef, Module, Provider } from "@nestjs/common";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";
import { ProfileDataCacheService } from "./profile-data/profile-data-cache.service";
import { DataBinCacheService } from "./data-bin/data-bin-cache.service";
import { NotificationCacheService } from "./notifications/notification-cache.service";
import { PluginCacheService } from "./plugins/plugin-cache.service";
import { PluginStatsService } from "./plugins/plugin-stats.service";
import { SteamService } from "./steam/steam.service";

const providers: Provider[] = [
  ProfileDataCacheService,
  DataBinCacheService,
  NotificationCacheService,
  PluginCacheService,
  PluginStatsService,
  SteamService,
];

@Module({
  imports: [forwardRef(() => InfrastructureModule)],
  providers: [...providers],
  exports: providers,
})
export class DomainModule { }
