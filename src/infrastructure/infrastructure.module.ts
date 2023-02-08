import { Module, Provider } from "@nestjs/common";
import { DomainModule } from "src/domain/domain.module";

const providers: Provider[] = [];

@Module({
  imports: [DomainModule],
  providers: [...providers],
  exports: providers,
})
export class InfrastructureModule {}
