import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Headers,
  RawBody,
} from "@nestjs/common";
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
    @Body() payload: unknown,
    @RawBody() rawBody: Buffer | undefined,
    @Headers() headers: Record<string, string>,
  ) {

    let rawPayload: string | undefined = undefined;
    if(rawBody) {
      try {
        rawPayload = rawBody.toString();
      } catch {}
    }

    this.firebotWebhooksService.handleWebhook(
      twitchUserId,
      webhookId,
      payload,
      rawPayload,
      headers,
    );
  }
}
