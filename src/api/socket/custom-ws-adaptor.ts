import { INestApplicationContext } from "@nestjs/common";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { WsAdapter } from "@nestjs/platform-ws";
import * as http from "http";
import { TwitchTokenValidatorService } from "../auth/twitch-token-validatior.service";
import { WebSocket } from "ws";
import { TwitchUser } from "src/domain/profile-data/profile-types";

export class CustomWsAdaptor extends WsAdapter {
  apiTokens: string[] = [];

  constructor(
    private readonly appOrHttpServer?: INestApplicationContext | undefined,
    private readonly defaultCorsOptions?: CorsOptions,
  ) {
    super(appOrHttpServer);
  }

  create(
    port: number,
    options?: Record<string, any> & {
      namespace?: string;
      server?: any;
      path?: string;
    },
  ) {
    return super.create(port, {
      ...(options ?? {}),
      cors: options?.cors ?? this.defaultCorsOptions,
    });
  }

  protected ensureHttpServerExists(
    port: number,
    httpServer = http.createServer(),
  ) {
    const twitchTokenValidator = this.appOrHttpServer?.get(
      TwitchTokenValidatorService,
    );

    if (!twitchTokenValidator) {
      return;
    }

    if (this.httpServersRegistry.has(port)) {
      return;
    }
    this.httpServersRegistry.set(port, httpServer);

    httpServer.on("upgrade", async (request, socket, head) => {
      try {
        const baseUrl = "ws://" + request.headers.host + "/";
        const pathname = new URL(request.url ?? "", baseUrl).pathname;
        const wsServersCollection = this.wsServersRegistry.get(port) ?? [];

        let isRequestDelegated = false;
        for (const wsServer of wsServersCollection) {
          if (pathname === wsServer.path) {
            let user: TwitchUser | null = null;
            if (wsServer?.options?.auth) {
              user =
                await twitchTokenValidator.validateAuthorizationHeaderAndGetUserData(
                  request.headers["authorization"],
                );
              if (!user) {
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
              }
            }
            wsServer.handleUpgrade(
              request,
              socket,
              head,
              (client: WebSocket) => {
                (socket as any).user = user;
                wsServer.emit("connection", client, request);
              },
            );
            isRequestDelegated = true;
            break;
          }
        }
        if (!isRequestDelegated) {
          socket.destroy();
        }
      } catch (err) {
        socket.end("HTTP/1.1 400\r\n" + err.message);
      }
    });
    return httpServer;
  }
}
