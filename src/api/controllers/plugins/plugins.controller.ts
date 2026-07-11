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
import { TwitchAuth } from "src/api/decorators/twitch-auth";
import { CurrentUser } from "src/api/decorators/current-user.decorator";
import type { TwitchUser } from "src/domain/profile-data/profile-types";
import { PluginRefDto } from "./dtos/plugin-ref.dto";
import { PluginSearchDto } from "./dtos/plugin-search.dto";
import { PluginUpdateCheckDto } from "./dtos/plugin-update-check.dto";

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
    @Body() body: PluginSearchDto,
  ) {
    return await this.pluginCache.searchPlugins({
      query: body.query,
      category: body.category,
      sortBy: body.sortBy ?? "popular",
      page: body.page ?? 1,
      pageSize: body.pageSize ?? 20,
      firebotVersion: body.firebotVersion,
    });
  }

  @Post("updates")
  @HttpCode(200)
  async checkPluginsForUpdates(
    @Body() request: PluginUpdateCheckDto
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
