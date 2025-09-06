import {
  Body,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiResponse } from "@nestjs/swagger";
import { TwitchAuthGuard } from "src/api/auth/twitch-auth.guard";
import { DataBinCacheService } from "src/domain/data-bin/data-bin-cache.service";
import { StoreDataResponseDto } from "./dtos/store-data-response.dto";

@Controller({
  path: "data-bin",
})
export class DataBinController {
  constructor(private readonly dataBinCache: DataBinCacheService) {}

  @Post()
  @UseGuards(TwitchAuthGuard)
  @ApiBearerAuth("twitchAuth")
  @ApiConsumes("text/plain")
  @ApiResponse({
    type: StoreDataResponseDto,
    status: 201,
  })
  async storeData(@Body() data: string) {
    return await this.dataBinCache.setData(data);
  }

  @Get(":key")
  @Header("content-type", "text/plain")
  async getData(@Param("key") key: string) {
    const data = await this.dataBinCache.getData(key);

    if (!data) {
      throw new NotFoundException();
    }

    return data;
  }
}
