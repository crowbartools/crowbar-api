import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional } from "class-validator";

export class FirebotVersionDto {
  @ApiProperty()
  @IsInt()
  major: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  minor?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  patch?: number;
}
