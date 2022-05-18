import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import getLogLevels from './utils/get-log-levels';

const API_VERSION = 2;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: getLogLevels(process.env.NODE_ENV === 'production'),
  });

  app.use(cookieParser());
  const configService = app.get<ConfigService>(ConfigService);

  app.setGlobalPrefix(`api/v${API_VERSION}`);

  const config = new DocumentBuilder()
    .setTitle('Uni Verse FM')
    .setDescription('Planet main api backend 🪐')
    .setVersion(`${API_VERSION}`)
    .addCookieAuth(
      'auth-cookie',
      {
        type: 'http',
        in: 'Header',
        scheme: 'Bearer',
      },
      'Set-Cookie',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`api/v${API_VERSION}/docs`, app, document);

  const corsConfig = {
    origin: [configService.get('FRONTEND_URL'), 'http://localhost:3000'],
    optionsSuccessStatus: 200,
    allowedHeaders: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
      'Set-Cookie',
      'Access-Control-Allow-Origin',
      'Access-Control-Allow-Methods',
      'Access-Control-Allow-Headers',
      'Access-Control-Allow-Credentials',
    ],
    credentials: true,
  };

  app.enableCors(corsConfig);
  await app.listen(configService.get('PORT') || 3000);

  console.log(`Turnnig 💫 on port ${configService.get('PORT') || 3000}`);
}
bootstrap();
