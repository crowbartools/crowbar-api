import { Injectable } from "@nestjs/common";
import { TypedEmitter } from "tiny-typed-emitter";

@Injectable()
export class FirebotWebhooksService extends TypedEmitter<{
  "webhook-triggered": (details: {
    clientId: string;
    twitchUserId: string;
    webhookId: string;
    payload: unknown;
    rawPayload?: string;
    headers: Record<string, string>;
  }) => void;
}> {
  constructor() {
    super();
  }

  private twitchWebhookMap = new Map<string, Record<string, string[]>>();

  public updateWebhooksForUser(
    websocketClientId: string,
    twitchUserId: string,
    webhookIds: string[],
  ) {
    const existing = this.twitchWebhookMap.get(twitchUserId) || {};
    existing[websocketClientId] = webhookIds;
    this.twitchWebhookMap.set(twitchUserId, existing);
  }

  public getWebhooksForUser(
    twitchUserId: string,
  ): Record<string, string[]> | undefined {
    const userWebhooks = this.twitchWebhookMap.get(twitchUserId);
    return userWebhooks;
  }

  public handleWebhook(
    twitchUserId: string,
    webhookId: string,
    payload: unknown,
    rawPayload: string | undefined,
    headers: Record<string, string>,
  ) {
    const userWebhooks = this.getWebhooksForUser(twitchUserId);

    if (!userWebhooks) {
      return;
    }

    for (const [clientId, webhookIds] of Object.entries(userWebhooks)) {
      const clientHasWebhook = webhookIds.includes(webhookId);
      if (!clientHasWebhook) {
        continue;
      }
      this.emit("webhook-triggered", {
        clientId,
        twitchUserId,
        webhookId,
        payload,
        rawPayload,
        headers,
      });
    }
  }
}
