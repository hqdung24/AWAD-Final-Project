import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePaymentSession {
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}
