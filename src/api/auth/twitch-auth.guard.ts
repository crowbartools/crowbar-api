import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from "@nestjs/common";
import axios, { AxiosResponse } from "axios";
import { Cache } from "cache-manager";
import { Request } from "express";

const AUTH_SCHEME = "bearer";
const AUTH_REGEX = /(\S+)\s+(\S+)/;

type TwitchValidateResponse = {
  client_id: string;
  login: string;
  user_id: string;
};

@Injectable()
export class TwitchAuthGuard implements CanActivate {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (await this.isAuthenticated(request)) {
      return true;
    }

    throw new UnauthorizedException();
  }

  private async isAuthenticated(request: Request) {
    const authHeader = this.parseAuthHeader(request);

    if (authHeader == null) {
      return false;
    }

    if (authHeader.scheme?.toLowerCase() !== AUTH_SCHEME) {
      return false;
    }

    const validatedTokenData = await this.cacheManager.wrap(
      authHeader.token,
      async () => {
        return await this.getValidatedToken(authHeader.token);
      },
      { ttl: 60 * 60 /* 1 hour */, refreshThreshold: 55 * 60 /* 55 minutes */ },
    );

    if (validatedTokenData == null) {
      return false;
    }

    request.user = {
      twitchUsername: validatedTokenData.login,
      twitchUserId: validatedTokenData.user_id,
    };

    return true;
  }

  private async getValidatedToken(
    twitchToken: string,
  ): Promise<TwitchValidateResponse | null> {
    try {
      const response: AxiosResponse<TwitchValidateResponse> = await axios.get(
        "https://id.twitch.tv/oauth2/validate",
        {
          headers: {
            Authorization: `Bearer ${twitchToken}`,
          },
        },
      );
      if (response.status === 200) {
        return response.data;
      }
    } catch (error) {}

    return null;
  }

  private parseAuthHeader(request: Request) {
    const headerValue = request.headers.authorization;
    if (!headerValue) {
      return null;
    }

    const matches = headerValue.match(AUTH_REGEX);
    return matches && { scheme: matches[1], token: matches[2] };
  }
}
