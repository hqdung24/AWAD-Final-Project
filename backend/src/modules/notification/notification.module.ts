import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationRepository } from './notification.repository';
import { UsersModule } from '../users/users.module';
import { NotificationCreateProvider } from './providers/notification-create.provider';
import { BookingModule } from '../booking/booking.module';
import { NotificationReminderPayloadProvider } from './providers/notification-reminder-payload.provider';
import { NotificationEventsListener } from './listeners/notification-events.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference]),
    UsersModule,
    BookingModule,
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    NotificationCreateProvider,
    NotificationReminderPayloadProvider,
    NotificationEventsListener,
  ],
  exports: [
    NotificationService,
    NotificationRepository,
    NotificationCreateProvider,
    NotificationReminderPayloadProvider,
  ],
})
export class NotificationModule {}
