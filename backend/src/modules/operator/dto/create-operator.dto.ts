import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  name: string;

  @IsEmail()
  contactEmail: string;

  @IsString()
  contactPhone: string;

  @IsString()
  status: string; // pending / active / suspended

  @IsOptional()
  approvedAt?: Date;
}
