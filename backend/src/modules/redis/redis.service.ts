import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.provider';
import type { RedisClient } from './redis.provider';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: RedisClient,
  ) {}

  getClient(): RedisClient {
    return this.client;
  }

  // Raw redis methods
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  async setIfNotExists(
    key: string,
    value: string,
    ttl: number,
  ): Promise<boolean> {
    const result = await this.client.set(key, value, 'EX', ttl, 'NX');
    return result === 'OK';
  }

  async set(key: string, value: string, expirationSeconds: number) {
    await this.client.set(key, value, 'EX', expirationSeconds);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  //Specific methods
}
