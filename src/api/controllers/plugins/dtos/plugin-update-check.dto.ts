import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsDefined, ValidateNested } from "class-validator";
import { FirebotVersionDto } from "./firebot-version.dto";
import { PluginRefDto } from "./plugin-ref.dto";

export class PluginUpdateCheckDto {
  @ApiProperty({ type: [PluginRefDto] })
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PluginRefDto)
  plugins: PluginRefDto[];

  @ApiProperty({ type: FirebotVersionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => FirebotVersionDto)
  firebotVersion: FirebotVersionDto;
}
