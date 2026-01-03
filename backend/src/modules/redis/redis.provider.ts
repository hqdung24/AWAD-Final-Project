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
    if (this.redisConfiguration.url) {
      this.client = new Redis(this.redisConfiguration.url);
    } else {
      this.client = new Redis({
        host: this.redisConfiguration.host,
        port: this.redisConfiguration.port,
        username: this.redisConfiguration.username,
        password: this.redisConfiguration.password,
        tls: this.redisConfiguration.tls,
      });
    }
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
