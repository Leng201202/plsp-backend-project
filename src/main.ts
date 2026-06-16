import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { corsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS with specific origin from environment variable
  app.enableCors(corsConfig);
  
  // Load OpenAPI spec from swagger.json (no source code decorators needed)
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../swagger.json'), 'utf-8'),
  );
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();