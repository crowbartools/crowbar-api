import { forwardRef, Module, Provider, Scope } from "@nestjs/common";
import { ICacheService } from "src/domain/cache/cache-service.interface";
import { DomainModule } from "src/domain/domain.module";
import { BasicMemoryCacheService } from "./cache/basic-memory-cache.service";

const providers: Provider[] = [
  {
    provide: ICacheService,
    useClass: BasicMemoryCacheService,
    scope: Scope.TRANSIENT,
  },
];

@Module({
  imports: [forwardRef(() => DomainModule)],
  providers: [...providers],
  exports: providers,
})
export class InfrastructureModule {}
