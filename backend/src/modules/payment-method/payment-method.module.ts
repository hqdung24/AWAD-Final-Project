import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodController } from './payment-method.controller';
import { PaymentMethodService } from './payment-method.service';
import { PaymentMethodRepository } from './payment-method.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod])],
  controllers: [PaymentMethodController],
  providers: [PaymentMethodService, PaymentMethodRepository],
  exports: [PaymentMethodService, PaymentMethodRepository],
})
export class PaymentMethodModule {}
