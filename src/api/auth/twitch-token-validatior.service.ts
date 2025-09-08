import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { Cache } from "cache-manager";
import { TwitchUser } from "src/domain/profile-data/profile-types";
import appConfig from "src/infrastructure/config";

const AUTH_SCHEME = "bearer";
const AUTH_REGEX = /(\S+)\s+(\S+)/;

type TwitchValidateResponse = {
  client_id: string;
  login: string;
  user_id: string;
};

@Injectable()
export class TwitchTokenValidatorService {
  constructor(
    @Inject(appConfig.KEY)
    private config: ConfigType<typeof appConfig>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async validateAuthorizationHeaderAndGetUserData(
    authorizationHeader?: string,
  ): Promise<TwitchUser | null> {
    if (!authorizationHeader) {
      return null;
    }

    const parsedAuthHeader = this.parseAuthHeader(authorizationHeader);

    if (parsedAuthHeader == null) {
      return null;
    }

    if (parsedAuthHeader.scheme?.toLowerCase() !== AUTH_SCHEME) {
      return null;
    }

    const validatedTokenData = await this.cacheManager.wrap(
      parsedAuthHeader.token,
      async () => {
        return await this.getValidatedToken(parsedAuthHeader.token);
      },
      { ttl: 60 * 60 /* 1 hour */, refreshThreshold: 55 * 60 /* 55 minutes */ },
    );

    if (validatedTokenData == null) {
      return null;
    }

    if (validatedTokenData.client_id !== this.config.twitchClientId) {
      return null;
    }

    return {
      twitchUsername: validatedTokenData.login,
      twitchUserId: validatedTokenData.user_id,
    };
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

  private parseAuthHeader(authorizationHeader: string) {
    if (!authorizationHeader) {
      return null;
    }

    const matches = authorizationHeader.match(AUTH_REGEX);
    return matches && { scheme: matches[1], token: matches[2] };
  }
}
