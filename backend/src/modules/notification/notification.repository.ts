import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from './enums/notification.enum';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly repository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async createNotification(input: {
    userId: string;
    channel: NotificationChannel;
    type: NotificationType;
    payload: Record<string, any>;
    status?: NotificationStatus;
    bookingId?: string;
    sentAt?: Date;
  }): Promise<Notification> {
    const entity = this.repository.create({
      userId: input.userId,
      channel: input.channel,
      type: input.type,
      payload: input.payload,
      status: input.status ?? NotificationStatus.PENDING,
      sentAt: input.sentAt,
      booking: input.bookingId ? { id: input.bookingId } : undefined,
    });

    return this.repository.save(entity);
  }

  async findNotificationById(id: string): Promise<Notification | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findNotificationsByUser(
    userId: string,
    options?: { status?: NotificationStatus; limit?: number },
  ): Promise<Notification[]> {
    return this.repository.find({
      where: {
        userId,
        ...(options?.status ? { status: options.status } : {}),
      },
      order: { sentAt: 'DESC', id: 'DESC' },
      take: options?.limit,
    });
  }

  async findNotificationsByUserPaginated(
    userId: string,
    options: {
      status?: NotificationStatus;
      page: number;
      limit: number;
    },
  ): Promise<[Notification[], number]> {
    const skip = (options.page - 1) * options.limit;

    return this.repository.findAndCount({
      where: {
        userId,
        ...(options.status ? { status: options.status } : {}),
      },
      order: { sentAt: 'DESC', id: 'DESC' },
      skip,
      take: options.limit,
    });
  }

  async countUnreadByUser(userId: string): Promise<number> {
    return this.repository.count({
      where: {
        userId,
        status: Not(NotificationStatus.READ),
      },
    });
  }

  async markMultipleAsRead(
    userId: string,
    notificationIds: string[],
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('userId = :userId', { userId })
      .andWhere('status != :readStatus', {
        readStatus: NotificationStatus.READ,
      })
      .execute();

    return result.affected || 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Notification)
      .set({
        status: NotificationStatus.READ,
        readAt: new Date(),
      })
      .where('userId = :userId', { userId })
      .andWhere('status != :readStatus', {
        readStatus: NotificationStatus.READ,
      })
      .execute();

    return result.affected || 0;
  }

  async deleteNotification(
    id: string,
    userId: string,
  ): Promise<{ affected: number }> {
    const result = await this.repository.delete({ id, userId });
    return { affected: result.affected || 0 };
  }

  async deleteMultipleNotifications(
    notificationIds: string[],
    userId: string,
  ): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('id IN (:...ids)', { ids: notificationIds })
      .andWhere('userId = :userId', { userId })
      .execute();

    return result.affected || 0;
  }

  async markAsRead(id: string): Promise<Notification | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) return null;

    existing.status = NotificationStatus.READ;
    existing.readAt = new Date();
    return this.repository.save(existing);
  }

  async updateStatus(
    id: string,
    status: NotificationStatus,
    sentAt?: Date,
  ): Promise<Notification | null> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) return null;

    existing.status = status;
    if (sentAt) {
      existing.sentAt = sentAt;
    }
    return this.repository.save(existing);
  }

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
