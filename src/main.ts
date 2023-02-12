import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle("Crowbar API")
    .setDescription("Documentation for the Crowbar API")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.listen(3000);
}
bootstrap();
