import { Module, forwardRef } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { SeatModule } from '../seat/seat.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '@/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
import { RealtimeNotificationListener } from './listeners/realtime-notification.listener';
import { RealtimeTripStatusListener } from './listeners/realtime-trip-status.listener';
@Module({
  providers: [
    RealtimeGateway,
    RealtimeService,
    RealtimeNotificationListener,
    RealtimeTripStatusListener,
  ],
  exports: [RealtimeService, RealtimeGateway],
  imports: [
    forwardRef(() => SeatModule),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
})
export class RealtimeModule {}
