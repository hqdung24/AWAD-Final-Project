import { Body, Controller, Get, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationPreferencesResponseDto } from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('preferences/me')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Get current user notification preferences' })
  @ApiResponse({
    status: 200,
    type: NotificationPreferencesResponseDto,
  })
  async getMyPreferences(
    @ActiveUser('sub') userId: string,
  ): Promise<NotificationPreferencesResponseDto> {
    const prefs = await this.notificationService.getPreferencesForUser(userId);
    return {
      emailRemindersEnabled: prefs.emailRemindersEnabled,
      smsRemindersEnabled: prefs.smsRemindersEnabled,
      updatedAt: prefs.updatedAt?.toISOString(),
    };
  }

  @Patch('preferences')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Update current user notification preferences' })
  @ApiResponse({
    status: 200,
    type: NotificationPreferencesResponseDto,
  })
  async updateMyPreferences(
    @ActiveUser('sub') userId: string,
    @Body() dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesResponseDto> {
    const prefs = await this.notificationService.updatePreferencesForUser(
      userId,
      dto,
    );
    return {
      emailRemindersEnabled: prefs.emailRemindersEnabled,
      smsRemindersEnabled: prefs.smsRemindersEnabled,
      updatedAt: prefs.updatedAt?.toISOString(),
    };
  }
}
