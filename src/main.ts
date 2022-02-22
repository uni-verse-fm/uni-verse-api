import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

const API_VERSION = 2

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(`api/v${API_VERSION}`);

  const config = new DocumentBuilder()
    .setTitle('Uni Verse FM')
    .setDescription('Planet main api backend 🪐')
    .setVersion(`${API_VERSION}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`api/v${API_VERSION}/docs`, app, document);

  await app.listen(3000);

  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
}
bootstrap();
