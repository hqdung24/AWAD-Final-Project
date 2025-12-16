import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesResponseDto {
  @ApiProperty({ description: 'Whether email reminders are enabled' })
  emailRemindersEnabled: boolean;

  @ApiProperty({ description: 'Whether SMS reminders are enabled' })
  smsRemindersEnabled: boolean;

  @ApiProperty({ description: 'When the preferences were last updated' })
  updatedAt?: string;
}
