import { forwardRef, Module, Provider } from "@nestjs/common";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";
import { ProfileDataCacheService } from "./profile-data/profile-data-cache.service";

const providers: Provider[] = [ProfileDataCacheService];

@Module({
  imports: [forwardRef(() => InfrastructureModule)],
  providers: [...providers],
  exports: providers,
})
export class DomainModule {}
