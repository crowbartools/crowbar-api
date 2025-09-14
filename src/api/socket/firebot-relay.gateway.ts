import { UsePipes, ValidationPipe } from "@nestjs/common";
import {
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { Server, WebSocket } from "ws";
import { UpdateWebhooksDto } from "./dtos/update-webhooks.dto";
import {
  TwitchUser,
  WebSocketUser,
} from "src/domain/profile-data/profile-types";
import { CurrentUser } from "../decorators/current-user.decorator";
import { FirebotWebhooksService } from "../services/firebot-webhooks.service";

@UsePipes(
  new ValidationPipe({ exceptionFactory: (errors) => new WsException(errors) }),
)
@WebSocketGateway({
  cors: {
    origin: "*",
  },
  path: "/v1/relay",
  auth: true,
})
export class FirebotRelayGateway implements OnGatewayDisconnect {
  constructor(private readonly firebotWebhooksService: FirebotWebhooksService) {
    this.firebotWebhooksService.on("webhook-triggered", (details) => {
      this.broadcastMessageToClientId(details.clientId, "webhook", {
        webhookId: details.webhookId,
        payload: details.payload,
      });
    });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage("update-webhooks")
  handleUpdateWebhooks(
    @MessageBody() data: UpdateWebhooksDto,
    @CurrentUser() user: WebSocketUser,
  ) {
    this.firebotWebhooksService.updateWebhooksForUser(
      user.clientId,
      user.twitchUserId,
      data.webhookIds,
    );
  }

  handleDisconnect(client: WebSocket) {
    const user = (client as any)?._socket?.user as WebSocketUser | null;
    if (!user) {
      return;
    }
    this.firebotWebhooksService.updateWebhooksForUser(
      user.clientId,
      user.twitchUserId,
      [],
    );
  }

  /**
   * Sends a message to all connected clients for a specific Twitch user ID.
   */
  public broadcastMessageToTwitchUser(
    twitchUserId: string,
    event: string,
    data: unknown,
  ): void {
    const clients = Array.from(this.server.clients).filter((client) => {
      const user = (client as any)?._socket?.user as TwitchUser | null;
      return user?.twitchUserId === twitchUserId;
    });

    for (const client of clients) {
      this.sendMessageToClient(client, event, data);
    }
  }

  public broadcastMessageToClientId(
    clientId: string,
    event: string,
    data: unknown,
  ): void {
    const clients = Array.from(this.server.clients).filter((client) => {
      const user = (client as any)?._socket?.user as WebSocketUser | null;
      return user?.clientId === clientId;
    });

    for (const client of clients) {
      this.sendMessageToClient(client, event, data);
    }
  }

  private sendMessageToClient(client: WebSocket, event: string, data: unknown) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ event, data }));
    }
  }
}
