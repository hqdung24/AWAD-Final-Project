import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Auth } from '../auth/decorator/auth.decorator';
import { AuthType } from '../auth/enums/auth-type.enum';
import { ActiveUser } from '../auth/decorator/active-user.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationPreferencesResponseDto } from './dto/notification-preferences-response.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import { NotificationListQueryDto } from './dto/notification-list-query.dto';
import { NotificationListResponseDto } from './dto/notification-response.dto';
import { MarkAsReadDto } from './dto/mark-as-read.dto';

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

  @Get()
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Get current user notifications with pagination' })
  @ApiResponse({
    status: 200,
    type: NotificationListResponseDto,
  })
  async getMyNotifications(
    @ActiveUser('sub') userId: string,
    @Query() query: NotificationListQueryDto,
  ): Promise<NotificationListResponseDto> {
    const result = await this.notificationService.getNotifications(userId, {
      status: query.status,
      page: query.page || 1,
      limit: query.limit || 20,
    });

    return {
      data: result.data.map((n) => ({
        id: n.id,

        userId: n.userId,

        channel: n.channel,

        type: n.type,

        status: n.status,

        payload: n.payload,

        sentAt: n.sentAt?.toISOString(),

        readAt: n.readAt?.toISOString(),
      })),

      total: result.total,

      page: result.page,

      limit: result.limit,

      totalPages: result.totalPages,

      unreadCount: result.unreadCount,
    };
  }

  @Post('mark-as-read')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Mark notifications as read' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        affected: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async markAsRead(
    @ActiveUser('sub') userId: string,
    @Body() dto: MarkAsReadDto,
  ): Promise<{ affected: number; message: string }> {
    const result = await this.notificationService.markNotificationsAsRead(
      userId,
      dto.notificationIds,
    );
    return {
      affected: result.affected,

      message: `${result.affected} notification(s) marked as read`,
    };
  }

  @Post('mark-all-as-read')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        affected: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async markAllAsRead(
    @ActiveUser('sub') userId: string,
  ): Promise<{ affected: number; message: string }> {
    const result =
      await this.notificationService.markAllNotificationsAsRead(userId);
    return {
      affected: result.affected,

      message: `${result.affected} notification(s) marked as read`,
    };
  }

  @Delete(':id')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Delete a single notification' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  async deleteNotification(
    @ActiveUser('sub') userId: string,
    @Param('id') notificationId: string,
  ): Promise<{ success: boolean; message: string }> {
    const result = await this.notificationService.deleteNotification(
      notificationId,
      userId,
    );
    return {
      success: result.success,

      message: result.success
        ? 'Notification deleted successfully'
        : 'Notification not found or already deleted',
    };
  }

  @Post('delete-multiple')
  @Auth(AuthType.Bearer)
  @ApiOperation({ summary: 'Delete multiple notifications' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        affected: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async deleteMultipleNotifications(
    @ActiveUser('sub') userId: string,
    @Body() dto: MarkAsReadDto,
  ): Promise<{ affected: number; message: string }> {
    const result = await this.notificationService.deleteNotifications(
      userId,
      dto.notificationIds,
    );
    return {
      affected: result.affected,

      message: `${result.affected} notification(s) deleted`,
    };
  }
}
