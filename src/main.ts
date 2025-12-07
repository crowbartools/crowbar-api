import { ValidationPipe, VersioningType } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { CustomWsAdaptor } from "./api/socket/custom-ws-adaptor";
import type { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
    rawBody: true,
  });

  const configService = app.get(ConfigService);

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

  app.useWebSocketAdapter(new CustomWsAdaptor(app));

  app.useBodyParser('json', { limit: maxRequestBodySize });
  app.useBodyParser('text', { limit: maxRequestBodySize });
  app.useBodyParser('urlencoded', { limit: maxRequestBodySize });
  app.useBodyParser('raw', { limit: maxRequestBodySize });

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

  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
