import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TwitchAuthGuard } from "src/api/auth/twitch-auth.guard";
import { ApiBearerAuth } from "@nestjs/swagger";
import { SteamService } from "src/domain/steam/steam.service";

@Controller({
  path: "steam",
})
export class SteamController {
  constructor(private readonly steamService: SteamService) {}

  @Get("find-app-id")
  @UseGuards(TwitchAuthGuard)
  @ApiBearerAuth("twitchAuth")
  async findSteamAppId(@Query("search") search: string) {
    if (!search?.trim()) {
      throw new BadRequestException("Search parameter is required");
    }
    const appId = await this.steamService.findSteamAppIdByName(search);
    return appId;
  }
}
