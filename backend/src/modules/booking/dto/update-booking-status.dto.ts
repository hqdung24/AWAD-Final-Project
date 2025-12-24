import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'paid', 'cancelled', 'expired'])
  @ApiProperty({ example: 'paid' })
  status: string;
}
