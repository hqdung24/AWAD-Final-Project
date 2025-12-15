import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '@/modules/booking/entities/booking.entity';
import { Payment } from '@/modules/payment/entities/payment.entity';
import { Route } from '@/modules/route/entities/route.entity';
import { Trip } from '@/modules/trip/entities/trip.entity';
import { Operator } from '@/modules/operator/entities/operator.entity';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Payment, Route, Trip, Operator])],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}
