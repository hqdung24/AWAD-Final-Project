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
@Module({
  imports: [
    TypeOrmModule.forFeature([SeatStatus]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [SeatStatusController],
  providers: [SeatStatusService, SeatStatusRepository, SeatLockProvider],
  exports: [SeatStatusService, SeatStatusRepository],
})
export class SeatStatusModule {}
