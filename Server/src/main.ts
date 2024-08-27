import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config(); 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
      origin: 'http://localhost:3001',
      credentials: true,
  });

  app.use(cookieParser());

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

  await app.listen(3000);
}

bootstrap();
