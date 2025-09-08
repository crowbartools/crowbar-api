import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { TwitchTokenValidatorService } from "./twitch-token-validatior.service";

@Injectable()
export class TwitchAuthGuard implements CanActivate {
  constructor(
    private readonly twitchTokenValidator: TwitchTokenValidatorService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    if (await this.isAuthenticated(request)) {
      return true;
    }

    throw new UnauthorizedException();
  }

  private async isAuthenticated(request: Request) {
    const userData =
      await this.twitchTokenValidator.validateAuthorizationHeaderAndGetUserData(
        request.headers.authorization,
      );

    if (userData == null) {
      return false;
    }

    request.user = userData;

    return true;
  }
}
