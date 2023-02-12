import { IsObject } from "class-validator";

export class ProfileDataDto {
  @IsObject({ each: true })
  quotes: any[];

  @IsObject({ each: true })
  commands: any[];

  @IsObject({ each: true })
  sortTags: any[];

  @IsObject({ each: true })
  variables: any[];
}
