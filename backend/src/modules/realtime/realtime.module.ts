import { Module } from '@nestjs/common';
import { RealtimeController } from './realtime.controller';
import { RealtimeService } from './providers/realtime.service';

@Module({
  controllers: [RealtimeController],
  providers: [RealtimeService]
})
export class RealtimeModule {}
