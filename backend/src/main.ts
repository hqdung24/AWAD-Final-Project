import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ConfigService } from '@nestjs/config';
import { config } from 'aws-sdk';
import { writeFileSync } from 'fs';
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
  const swaggerConfig = new DocumentBuilder()
    .setVersion('1.0')
    .setTitle('BlauChat API Documentation')
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

  //AWS SDK configuration
  const configAws = app.get(ConfigService);
  config.update({
    credentials: {
      accessKeyId: configAws.get('app.aws.accessKey')!,
      secretAccessKey: configAws.get('app.aws.secretAccessKey')!,
    },
    region: configAws.get<string>('app.aws.region'),
  });

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
