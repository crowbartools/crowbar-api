import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { json, text } from "express";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const configService = app.get(ConfigService);

  const env = configService.get<string>("app.env");
  const port = configService.get<number>("app.port")!;
  const maxRequestBodySize = configService.get<string>(
    "app.maxRequestBodySize",
  );

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe());

  app.enableVersioning({
    defaultVersion: "1",
    type: VersioningType.URI,
  });

  app.use(json({ limit: maxRequestBodySize }));
  app.use(text({ type: "text/*", limit: maxRequestBodySize }));

  if (env !== "production") {
    const config = new DocumentBuilder()
      .setTitle("Crowbar API")
      .setDescription("Documentation for the Crowbar API")
      .setVersion("1.0")
      .addBearerAuth(
        {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        "twitchAuth",
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("docs", app, document);
  }

  await app.listen(port);
}
bootstrap();
