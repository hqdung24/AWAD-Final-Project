import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;
  console.log('app listen on port ', port);
  console.log('NODE ENV', process.env.NODE_ENV);

  //Enable cors
  app.enableCors({
    origin: true,
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
  const config = new DocumentBuilder()
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

  //Init Document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  //add prefix api
  app.setGlobalPrefix('api');
  await app.listen(port);
}
void bootstrap();
