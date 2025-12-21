import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';
import { SeatModule } from '../seat/seat.module';
import { ConfigModule } from '@nestjs/config';
import { jwtConfig } from '@/config/jwt.config';
import { JwtModule } from '@nestjs/jwt';
@Module({
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService, RealtimeGateway],
  imports: [
    SeatModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
})
export class RealtimeModule {}
