import { jwtConfig } from '@/config/jwt.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatStatus } from './entities/seat-status.entity';
import { SeatLockProvider } from './providers/seat-lock.provider';
import { SeatStatusController } from './seat-status.controller';
import { SeatStatusRepository } from './seat-status.repository';
import { SeatStatusService } from './seat-status.service';
import { SeatSelectingProvider } from './providers/seat-selecting.provider';
import { RedisModule } from '../redis/redis.module';
import { RealtimeModule } from '../realtime/realtime.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([SeatStatus]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    RedisModule,
    RealtimeModule,
  ],
  controllers: [SeatStatusController],
  providers: [
    SeatStatusService,
    SeatStatusRepository,
    SeatLockProvider,
    SeatSelectingProvider,
  ],
  exports: [SeatStatusService, SeatStatusRepository],
})
export class SeatStatusModule {}
