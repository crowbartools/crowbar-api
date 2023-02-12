import { Module } from "@nestjs/common";
import { DomainModule } from "src/domain/domain.module";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";
import { ProfileDataController } from "./controllers/profile/profile-data.controller";

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [ProfileDataController],
  providers: [],
})
export class ApiModule {}
