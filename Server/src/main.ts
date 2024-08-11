import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as dotenv from 'dotenv';

dotenv.config(); 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: 'http://localhost:3001', 
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.use(
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_KEY || 'justrandomkeyblablablaehdgsbgie'],
      maxAge: 24 * 60 * 60 * 1000,
      secure: true,
      httpOnly: true,
      sameSite: "none",
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
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  app.setGlobalPrefix('fdc-api');

  await app.listen(3000);
}

bootstrap();
