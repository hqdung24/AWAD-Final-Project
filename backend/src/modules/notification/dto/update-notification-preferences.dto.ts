import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: 'Enable or disable email notifications for reminders',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  emailRemindersEnabled?: boolean;

  @ApiPropertyOptional({
    description:
      'Enable or disable SMS notifications for reminders (requires phone)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  smsRemindersEnabled?: boolean;
}
