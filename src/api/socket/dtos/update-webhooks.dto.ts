import { IsString } from "class-validator";

export class UpdateWebhooksDto {
  @IsString({ each: true })
  webhookIds: string[];
}
