import { Body, Controller, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import { FirebotWebhooksService } from "src/api/services/firebot-webhooks.service";

@Controller({
  path: "webhook",
})
export class WebhookController {
  constructor(
    private readonly firebotWebhooksService: FirebotWebhooksService,
  ) {}

  @Post("/:twitchUserId/:webhookId")
  handleWebhook(
    @Param("twitchUserId") twitchUserId: string,
    @Param("webhookId", ParseUUIDPipe) webhookId: string,
    @Body() payload: any,
  ) {
    this.firebotWebhooksService.handleWebhook(twitchUserId, webhookId, payload);
  }
}
