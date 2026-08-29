// main.ts
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule   } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // strips properties not in the DTO
    transform: true,       // auto-converts payload types to match DTO types
  }));
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
