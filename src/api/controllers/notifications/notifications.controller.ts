import {
  Controller,
  Get,
  Header,
  Param,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { NotificationCacheService } from "../../../domain/notifications/notification-cache.service";

@Controller({
  path: "notifications",
})
export class NotificationsController {
  constructor(private readonly notificationCache: NotificationCacheService) {}

  @Get("refresh")
  @HttpCode(204)
  @ApiResponse({
      status: 204,
    })
  async refreshCache() {
    await this.notificationCache.refreshCache();
  }

  @SkipThrottle()
  @Get(":version")
  @Header("content-type", "text/json")
  async getData(@Param("version") version: string) {
    const data = await this.notificationCache.getData(version);    
    if (!data) {
      throw new NotFoundException();
    }
    return data;
  }
}