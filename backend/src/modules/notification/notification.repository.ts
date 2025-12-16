import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async findPreferenceByUserId(
    userId: string,
  ): Promise<NotificationPreference | null> {
    return this.preferenceRepository.findOne({ where: { userId } });
  }

  async upsertPreferences(
    userId: string,
    prefs: Partial<
      Pick<
        NotificationPreference,
        'emailRemindersEnabled' | 'smsRemindersEnabled'
      >
    >,
  ): Promise<NotificationPreference> {
    const existing = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (existing) {
      this.preferenceRepository.merge(existing, prefs);
      return this.preferenceRepository.save(existing);
    }

    const created = this.preferenceRepository.create({
      userId,
      emailRemindersEnabled: prefs.emailRemindersEnabled ?? true,
      smsRemindersEnabled: prefs.smsRemindersEnabled ?? false,
    });
    return this.preferenceRepository.save(created);
  }
}
