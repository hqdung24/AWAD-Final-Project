import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentController } from './payment.controller';
import { PaymentService } from './providers/payment.service';
import { PaymentEmailProvider } from './providers/payment-email.provider';
import { PaymentRepository } from './payment.repository';
import { ConfigModule } from '@nestjs/config';
import { payosConfig } from '@/config/payment.config';
import { BookingModule } from '../booking/booking.module';
import { appConfig } from '@/config/app.config';
@Module({
  imports: [
    TypeOrmModule.forFeature([Payment]),
    ConfigModule.forFeature(payosConfig),
    ConfigModule.forFeature(appConfig),
    BookingModule,
  ],
  controllers: [PaymentController],
  providers: [PaymentService, PaymentRepository, PaymentEmailProvider],
  exports: [PaymentService, PaymentRepository, PaymentEmailProvider],
})
export class PaymentModule {}
