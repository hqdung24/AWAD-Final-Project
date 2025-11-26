import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { writeFileSync } from 'fs';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  console.log('app listen on port ', port);
  console.log('NODE ENV', process.env.NODE_ENV);

  //Enable cors
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3900'];

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? allowedOrigins : true,
    credentials: true,
  });
  //Enable cookie parser
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Enable automatic transformation from payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allow implicit type conversion based on DTO types
      },
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());

  //Swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('Nest Auth API Documentation')
    .setDescription('The description of my application')
    .addServer('http://localhost:3600/api')
    .addCookieAuth('refreshToken')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Nhập JWT (không cần gõ "Bearer ")',
      },
      'accessToken',
    )
    .addSecurity('accessToken', {
      type: 'http',
      scheme: 'bearer',
    })
    .build();

  //Init Document
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  if (process.env.NODE_ENV !== 'production') {
    writeFileSync('./openapi.json', JSON.stringify(document, null, 2));
  }
  //add prefix api
  app.setGlobalPrefix('api');
  await app.listen(port);
}
void bootstrap();
