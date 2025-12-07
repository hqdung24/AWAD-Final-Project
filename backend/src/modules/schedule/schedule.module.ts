import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { SeatStatusModule } from '../seat-status/seat-status.module';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  // Register scheduler providers here (single forRoot)
  imports: [SeatStatusModule, NestScheduleModule.forRoot()],
  exports: [ScheduleService],
})
export class MyScheduleModule {}
