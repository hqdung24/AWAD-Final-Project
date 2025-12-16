import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UsersService } from '../users/providers/users.service';
import type { NotificationPreference } from './entities/notification-preference.entity';
import type { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly usersService: UsersService,
  ) {}

  async getPreferencesForUser(userId: string): Promise<NotificationPreference> {
    const existing =
      await this.notificationRepository.findPreferenceByUserId(userId);

    if (existing) {
      return existing;
    }

    return this.notificationRepository.upsertPreferences(userId, {});
  }

  async updatePreferencesForUser(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreference> {
    if (dto.smsRemindersEnabled === true) {
      const user = await this.usersService.findOneById(userId);
      if (!user.phone) {
        throw new BadRequestException(
          'A verified phone number is required to enable SMS notifications',
        );
      }
    }

    return this.notificationRepository.upsertPreferences(userId, dto);
  }
}
