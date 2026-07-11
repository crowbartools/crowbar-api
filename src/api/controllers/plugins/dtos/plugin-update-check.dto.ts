import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDefined, IsString, ValidateNested } from "class-validator";
import { FirebotVersionDto } from "./firebot-version.dto";
import { PluginRefDto } from "./plugin-ref.dto";

export class PluginVersionRefDto extends PluginRefDto {
  @ApiProperty()
  @IsString()
  version: string;
}

export class PluginUpdateCheckDto {
  @ApiProperty({ type: [PluginVersionRefDto] })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PluginVersionRefDto)
  plugins: PluginVersionRefDto[];

  @ApiProperty({ type: FirebotVersionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => FirebotVersionDto)
  firebotVersion: FirebotVersionDto;
}
