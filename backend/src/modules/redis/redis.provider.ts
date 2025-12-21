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
    const url = this.redisConfiguration.url;
    const host = this.redisConfiguration.host;
    const port = this.redisConfiguration.port ?? 6379;
    const connectionUrl: string = url ?? `redis://${host}:${port}`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const client: RedisClient = new Redis(connectionUrl);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.client = client;
  }

  getClient(): RedisClient {
    return this.client;
  }

  async onModuleDestroy(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
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
