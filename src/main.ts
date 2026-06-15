import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Load OpenAPI spec from swagger.json (no source code decorators needed)
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../swagger.json'), 'utf-8'),
  );
  SwaggerModule.setup('api-docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
