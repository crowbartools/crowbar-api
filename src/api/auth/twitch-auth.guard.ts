import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import axios from "axios";
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
  constructor(private readonly requestParam: string) {}

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

    const validatedTokenData = await this.getValidatedToken(authHeader.token);

    if (validatedTokenData == null) {
      return false;
    }

    if (validatedTokenData.login != request.params[this.requestParam]) {
      return false;
    }

    return true;
  }

  private async getValidatedToken(twitchToken: string) {
    try {
      const response = await axios.get<TwitchValidateResponse>(
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
