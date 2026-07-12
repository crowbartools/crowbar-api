import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { TwitchAuthGuard } from "../auth/twitch-auth.guard";

export function TwitchAuth() {
    const decorators = [
        UseGuards(TwitchAuthGuard),
        ApiBearerAuth("twitchAuth")
    ];
    return applyDecorators(...decorators);
}