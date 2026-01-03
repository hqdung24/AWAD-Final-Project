import { redisConfig } from '@/config/redis.config';
import { Injectable, OnModuleDestroy, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { Inject } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

export type RedisClient = Redis;
export const REDIS_CLIENT = 'REDIS_CLIENT';

@Injectable()
export class RedisClientProvider implements OnModuleDestroy {
  private readonly client: RedisClient;

  constructor(
    private readonly configService: ConfigService,
    //inject jwt config
    @Inject(redisConfig.KEY)
    private readonly redisConfiguration: ConfigType<typeof redisConfig>,
  ) {
    const username = this.redisConfiguration.username;
    const password = this.redisConfiguration.password;
    const host = this.redisConfiguration.host;
    const port = this.redisConfiguration.port;

    this.client = new Redis({
      host,
      port,
      username,
      password,
      tls: this.redisConfiguration.tls,
      maxRetriesPerRequest: 3,
    });
    this.client.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
  }

  getClient(): RedisClient {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }
}

export const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (provider: RedisClientProvider): RedisClient =>
    provider.getClient(),
  inject: [RedisClientProvider],
};

export const redisProviders: Provider[] = [RedisClientProvider, redisProvider];
