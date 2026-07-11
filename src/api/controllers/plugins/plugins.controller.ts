import {
  Controller,
  Get,
  Post,
  HttpCode,
  Body,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { PluginCacheService } from "../../../domain/plugins/plugin-cache.service";
import { PluginStatsService } from "../../../domain/plugins/plugin-stats.service";
import type {
  ManifestFirebotVersion,
  ManagedPluginUpdateRequest
} from "@crowbartools/firebot-types";
import { TwitchAuth } from "src/api/decorators/twitch-auth";
import { CurrentUser } from "src/api/decorators/current-user.decorator";
import type { TwitchUser } from "src/domain/profile-data/profile-types";
import { PluginRefDto } from "./dtos/plugin-ref.dto";

@Controller({
  path: "plugins",
})
export class PluginsController {
  constructor(
    private readonly pluginCache: PluginCacheService,
    private readonly pluginStats: PluginStatsService,
  ) { }

  @Get("refresh")
  @HttpCode(204)
  @ApiResponse({
    status: 204,
  })
  async refreshCache() {
    await this.pluginCache.refreshCache(true);
  }

  @Post("search")
  @HttpCode(200)
  async searchPlugins(
    @Body() body: { query: string, firebotVersion: ManifestFirebotVersion },
  ) {
    return await this.pluginCache.searchPlugins(body.query, body.firebotVersion);
  }

  @Post("updates")
  @HttpCode(200)
  async checkPluginsForUpdates(
    @Body() request: ManagedPluginUpdateRequest
  ) {
    return await this.pluginCache.checkPluginsForUpdates(request);
  }

  @Post("track-download")
  @HttpCode(200)
  @TwitchAuth()
  async trackDownload(
    @Body() body: PluginRefDto,
    @CurrentUser() user: TwitchUser
  ) {
    return await this.pluginStats.trackDownload(body.author, body.name, user.twitchUserId);
  }
}
