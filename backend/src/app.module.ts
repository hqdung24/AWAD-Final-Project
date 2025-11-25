import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DataResponseInterceptor } from './common/interceptors/data-response.interceptor';
import { ErrorsInterceptor } from './common/interceptors/errors.interceptor';
import { appConfig } from './config/app.config';
import { databaseConfig } from './config/database.config';
import { environmentValidationSchema } from './config/envinronment.validation';
import { UploadModule } from './modules/upload/upload.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
const ENV = process.env.NODE_ENV; //if (ENV === 'development' || ENV === 'test') 'development' : 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? `.env` : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: environmentValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: Number(config.get('database.port')),
        username: config.get('database.username'),
        password: config.get('database.password'),
        database: config.get('database.name'),
        autoLoadEntities: config.get('database.autoLoadEntities'),
        synchronize: config.get('database.synchronize'),
        logging: true, // tắt nếu không cần
      }),
    }),
    UsersModule,
    AuthModule,
    UploadModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: DataResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorsInterceptor,
    },
  ],
})
export class AppModule {}
