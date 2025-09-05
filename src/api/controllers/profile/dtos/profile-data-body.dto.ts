import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class ProfileDataDto {
  @ApiProperty({ type: Object, isArray: true })
  @IsObject({ each: true })
  quotes: unknown[];

  @ApiProperty({ type: Object, isArray: true })
  @IsObject({ each: true })
  commands: unknown[];

  @ApiProperty({ type: Object, isArray: true })
  @IsObject({ each: true })
  sortTags: unknown[];

  @ApiProperty({ type: Object, isArray: true })
  @IsObject({ each: true })
  variables: unknown[];
}
