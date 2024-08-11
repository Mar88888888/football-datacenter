import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';
import session from 'express-session';
dotenv.config(); 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3001', 
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === 'production', 
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000,
        },
      }),
  );

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
