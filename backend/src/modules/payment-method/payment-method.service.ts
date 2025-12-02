import { Injectable } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method.repository';

@Injectable()
export class PaymentMethodService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}
}
