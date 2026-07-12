import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  PLUGIN_CATEGORIES,
  PLUGIN_FEATURES,
  PLUGIN_SEARCH_SORT_MODES,
  type PluginCategory,
  type PluginFeature,
  type PluginSearchSortMode,
} from "../../../../domain/plugins/plugin-types";
import { FirebotVersionDto } from "./firebot-version.dto";

export class PluginSearchDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: PLUGIN_CATEGORIES })
  @IsOptional()
  @IsIn(PLUGIN_CATEGORIES)
  category?: PluginCategory;

  @ApiPropertyOptional({ enum: PLUGIN_FEATURES, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(PLUGIN_FEATURES, { each: true })
  features?: PluginFeature[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  official?: boolean;

  @ApiPropertyOptional({ enum: PLUGIN_SEARCH_SORT_MODES, default: "popular" })
  @IsOptional()
  @IsIn(PLUGIN_SEARCH_SORT_MODES)
  sortBy?: PluginSearchSortMode;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @ApiProperty({ type: FirebotVersionDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => FirebotVersionDto)
  firebotVersion: FirebotVersionDto;
}
