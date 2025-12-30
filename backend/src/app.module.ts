import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
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
import { redisConfig } from './config/redis.config';
import { environmentValidationSchema } from './config/envinronment.validation';
import { MediaModule } from './modules/media/media.module';
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
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RedisModule } from './modules/redis/redis.module';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import { EventEmitterModule } from '@nestjs/event-emitter';
const ENV = process.env.NODE_ENV; //if (ENV === 'development' || ENV === 'test') 'development' : 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? `.env` : `.env.${ENV}`,
      load: [appConfig, databaseConfig, redisConfig],
      validationSchema: environmentValidationSchema,
    }),
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('redis.url');
        const host = config.get<string>('redis.host');
        const port = config.get<number>('redis.port');
        const ttl = config.get<number>('redis.ttl');

        return {
          stores: [
            new Keyv<string>({
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              store: new CacheableMemory({ ttl: ttl, lruSize: 5000 }) as any,
            }),
            new KeyvRedis(url ?? `redis://${host}:${port}`),
          ],
        };
      },
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
    //Redis
    UsersModule,
    AuthModule,
    MediaModule,
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
    RealtimeModule,
    RedisModule,
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
