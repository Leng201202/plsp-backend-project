import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { redisConfig } from '../../config/redis.config';

/** Centralized cache key builders — keep keys consistent across modules. */
export const CacheKeys = {
  statusMap: () => `${redisConfig.keyPrefix}status:map`,
  questionsByQuestionnaire: (questionnaireId: string) =>
    `${redisConfig.keyPrefix}questions:questionnaire:${questionnaireId}`,
  classificationRulesByCategory: (categoryId: string) =>
    `${redisConfig.keyPrefix}classification:rules:category:${categoryId}`,
  submissionSession: (questionnaireId: string, sessionId: string) =>
    `${redisConfig.keyPrefix}submission:session:${questionnaireId}:${sessionId}`,
};

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private connected = false;

  get isAvailable(): boolean {
    return redisConfig.enabled && this.connected && this.client !== null;
  }

  async onModuleInit(): Promise<void> {
    if (!redisConfig.enabled) {
      this.logger.warn('Redis is disabled (REDIS_ENABLED=false). Cache lookups will use the database.');
      return;
    }

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 200, 1000)),
    });

    this.client.on('connect', () => {
      this.connected = true;
      this.logger.log(`Connected to Redis at ${redisConfig.host}:${redisConfig.port}`);
    });

    this.client.on('error', (error: Error) => {
      this.connected = false;
      this.logger.warn(`Redis error: ${error.message}`);
    });

    this.client.on('close', () => {
      this.connected = false;
    });

    try {
      await this.client.connect();
    } catch (error) {
      this.connected = false;
      this.logger.warn(
        `Could not connect to Redis — running without cache. ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
      this.connected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.safeCall(() => this.client!.get(key));
    if (raw === null || raw === undefined) {
      return null;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    const ttl = ttlSeconds ?? redisConfig.defaultTtlSeconds;

    await this.safeCall(async () => {
      if (ttl > 0) {
        await this.client!.set(key, serialized, 'EX', ttl);
      } else {
        await this.client!.set(key, serialized);
      }
    });
  }

  async del(...keys: string[]): Promise<void> {
    if (!keys.length) {
      return;
    }
    await this.safeCall(() => this.client!.del(...keys));
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.safeCall(() => this.client!.exists(key));
    return result === 1;
  }

  /**
   * Read-through cache: return cached value or run factory, store, and return.
   * Falls back to factory when Redis is unavailable.
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    if (this.isAvailable) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    const value = await factory();

    if (this.isAvailable) {
      await this.set(key, value, ttlSeconds);
    }

    return value;
  }

  private async safeCall<T>(operation: () => Promise<T>): Promise<T | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      return await operation();
    } catch (error) {
      this.logger.warn(
        `Redis operation failed: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }
}
