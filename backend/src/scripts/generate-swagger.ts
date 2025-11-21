import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generate() {
  const app = await NestFactory.create(AppModule, { logger: false });

  const swaggerConfig = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Nestjs learning api')
    .setDescription('The description of my application')
    .addServer('http://localhost:3600')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Nhập JWT (không cần gõ "Bearer ")',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const outPath = join(process.cwd(), 'swagger.json');
  writeFileSync(outPath, JSON.stringify(document, null, 2));
  // close app
  await app.close();

  console.log(`Swagger JSON written to ${outPath}`);
}

void generate();
