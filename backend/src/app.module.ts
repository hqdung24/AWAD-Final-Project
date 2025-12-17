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
import { PaymentMethodModule } from '@/modules/payment-method/payment-method.module';
import { OperatorModule } from '@/modules/operator/operator.module';
import { RouteModule } from '@/modules/route/route.module';
import { BusModule } from '@/modules/bus/bus.module';
import { SeatModule } from '@/modules/seat/seat.module';
import { TripModule } from '@/modules/trip/trip.module';
import { SeatStatusModule } from '@/modules/seat-status/seat-status.module';
import { BookingModule } from '@/modules/booking/booking.module';
import { PassengerDetailModule } from '@/modules/passenger-detail/passenger-detail.module';
import { PaymentModule } from '@/modules/payment/payment.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { FeedbackModule } from '@/modules/feedback/feedback.module';
import { ReportModule } from '@/modules/report/report.module';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ScheduleModule } from '@nestjs/schedule';
import { MyScheduleModule } from './modules/schedule/schedule.module';
import { AppController } from './app.controller';
import { MetricsModule } from './modules/metrics/metrics.module';

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
        // logging: true, // tắt nếu không cần
        namingStrategy: new SnakeNamingStrategy(),
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    UsersModule,
    AuthModule,
    UploadModule,
    DashboardModule,
    PaymentMethodModule,
    OperatorModule,
    RouteModule,
    BusModule,
    SeatModule,
    TripModule,
    SeatStatusModule,
    BookingModule,
    PassengerDetailModule,
    PaymentModule,
    NotificationModule,
    FeedbackModule,
    ReportModule,
    //Schedule module for cron jobs
    ScheduleModule.forRoot(),
    MyScheduleModule,
    MetricsModule,
  ],
  controllers: [AppController],
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
