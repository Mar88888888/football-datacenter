import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
let cookieSession = require('cookie-session');
import { ValidationPipe } from '@nestjs/common';
require('dotenv').config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cookieSession({
      keys: ['asdfasfd'],
    }),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  (app as any).set('etag', false);
  app.use((req: any, res: { removeHeader: (arg0: string) => void; }, next: () => void) => {
    res.removeHeader('x-powered-by');
    res.removeHeader('date');
    next();
  });

  app.setGlobalPrefix('fdc-api');

  await app.listen(3000);
}
bootstrap();
