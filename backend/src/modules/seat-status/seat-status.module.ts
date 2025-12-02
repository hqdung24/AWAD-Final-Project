import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatStatus } from './entities/seat-status.entity';
import { SeatStatusController } from './seat-status.controller';
import { SeatStatusService } from './seat-status.service';
import { SeatStatusRepository } from './seat-status.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SeatStatus])],
  controllers: [SeatStatusController],
  providers: [SeatStatusService, SeatStatusRepository],
  exports: [SeatStatusService, SeatStatusRepository],
})
export class SeatStatusModule {}
