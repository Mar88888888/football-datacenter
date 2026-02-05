import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',').map(o => o.trim()) || true,
      exposedHeaders: ['Retry-After'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  (app as any).set('etag', false);

  app.use((req: any, res: any, next: () => void) => {
    next();
  });

  app.setGlobalPrefix('fdc-api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
