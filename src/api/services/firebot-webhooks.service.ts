import { Injectable } from "@nestjs/common";
import { TypedEmitter } from "tiny-typed-emitter";

@Injectable()
export class FirebotWebhooksService extends TypedEmitter<{
  "webhook-triggered": (details: {
    twitchUserId: string;
    webhookId: string;
    payload: any;
  }) => void;
}> {
  constructor() {
    super();
  }

  private twitchWebhookMap = new Map<string, string[]>();

  public updateWebhooksForUser(twitchUserId: string, webhookIds: string[]) {
    this.twitchWebhookMap.set(twitchUserId, webhookIds);
  }

  public getWebhooksForUser(twitchUserId: string): string[] {
    return this.twitchWebhookMap.get(twitchUserId) ?? [];
  }

  public handleWebhook(twitchUserId: string, webhookId: string, payload: any) {
    const userWebhooks = this.getWebhooksForUser(twitchUserId);
    if (!userWebhooks.includes(webhookId)) {
      // Ignore webhooks that are not registered for the user
      return;
    }

    this.emit("webhook-triggered", { twitchUserId, webhookId, payload });
  }
}
