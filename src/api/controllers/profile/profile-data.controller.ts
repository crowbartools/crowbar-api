import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { TwitchAuthGuard } from "src/api/auth/twitch-auth.guard";
import { ProfileDataCacheService } from "src/domain/profile-data/profile-data-cache.service";
import { ProfileDataDto } from "./dtos/profile-data-body.dto";

@Controller({
  path: "profile-data",
})
export class ProfileDataController {
  constructor(private readonly profileDataCache: ProfileDataCacheService) {}

  @Get(":channelName")
  async getProfileData(@Param("channelName") channelName: string) {
    const profileData = await this.profileDataCache.get(channelName);

    if (!profileData) {
      throw new NotFoundException();
    }

    return profileData;
  }

  @Put(":channelName")
  @UseGuards(new TwitchAuthGuard("channelName"))
  async storeProfileData(
    @Param("channelName") channelName: string,
    @Body() profileData: ProfileDataDto,
  ) {
    await this.profileDataCache.save(channelName, profileData);
  }
}
