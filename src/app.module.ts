import { Module } from "@nestjs/common";
import { ApiModule } from "./api/api.module";
import { DomainModule } from "./domain/domain.module";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";

@Module({
  imports: [DomainModule, InfrastructureModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
