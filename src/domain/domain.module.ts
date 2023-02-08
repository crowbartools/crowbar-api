import { Module, Provider } from "@nestjs/common";

const providers: Provider[] = [];

@Module({
  providers: [...providers],
  exports: providers,
})
export class DomainModule {}
