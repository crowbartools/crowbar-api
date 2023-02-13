import { IsObject } from "class-validator";

export class ProfileDataDto {
  @IsObject({ each: true })
  quotes: unknown[];

  @IsObject({ each: true })
  commands: unknown[];

  @IsObject({ each: true })
  sortTags: unknown[];

  @IsObject({ each: true })
  variables: unknown[];
}


