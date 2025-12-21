// redis.module.ts

import { redisConfig } from '@/config/redis.config';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { redisProviders } from './redis.provider';
import { RedisService } from './redis.service';
@Module({
  providers: [...redisProviders, RedisService],
  exports: [...redisProviders, RedisService],
  imports: [ConfigModule.forFeature(redisConfig)],
})
export class RedisModule {}
