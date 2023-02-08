import { Module } from "@nestjs/common";
import { DomainModule } from "src/domain/domain.module";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [],
  providers: [],
})
export class ApiModule {}
