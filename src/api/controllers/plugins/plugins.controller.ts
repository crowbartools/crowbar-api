import {
  Controller,
  Get,
  Post,
  HttpCode,
  Body,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { PluginCacheService } from "../../../domain/plugins/plugin-cache.service";
import type {
  ManifestFirebotVersion,
  ManagedPluginUpdateRequest
} from "@crowbartools/firebot-types";

@Controller({
  path: "plugins",
})
export class PluginsController {
  constructor(private readonly pluginCache: PluginCacheService) { }

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
    @Body() body: { query: string, firebotVersion: ManifestFirebotVersion }
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
}