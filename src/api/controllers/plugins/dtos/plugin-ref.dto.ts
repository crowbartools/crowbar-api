import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class PluginRefDto {
  @ApiProperty()
  @IsString()
  author: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  version: string;
}
