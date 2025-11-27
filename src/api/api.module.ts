import { Module } from "@nestjs/common";
import { DomainModule } from "src/domain/domain.module";
import { InfrastructureModule } from "src/infrastructure/infrastructure.module";
import { ProfileDataController } from "./controllers/profile/profile-data.controller";
import { DataBinController } from "./controllers/data-bin/data-bin.controller";
import { FirebotRelayGateway } from "./socket/firebot-relay.gateway";
import { TwitchTokenValidatorService } from "./auth/twitch-token-validatior.service";
import { FirebotWebhooksService } from "./services/firebot-webhooks.service";
import { WebhookController } from "./controllers/webhook/webhook.controller";
import { NotificationsController } from "./controllers/notifications/notifications.controller";
import { SteamController } from "./controllers/steam/steam.controller";

@Module({
  imports: [DomainModule, InfrastructureModule],
  controllers: [
    ProfileDataController,
    DataBinController,
    WebhookController,
    NotificationsController,
    SteamController,
  ],
  providers: [
    TwitchTokenValidatorService,
    FirebotWebhooksService,
    FirebotRelayGateway,
  ],
})
export class ApiModule {}
