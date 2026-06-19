import 'dotenv/config';

export interface RedisConfig {
  enabled: boolean;
  host: string;
  port: number;
  password?: string;
  db: number;
  defaultTtlSeconds: number;
  sessionTtlSeconds: number;
  keyPrefix: string;
}

export const redisConfig: RedisConfig = {
  enabled: process.env.REDIS_ENABLED !== 'false',
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB ?? 0),
  defaultTtlSeconds: Number(process.env.REDIS_TTL ?? 3600),
  sessionTtlSeconds: Number(process.env.REDIS_SESSION_TTL ?? 86400),
  keyPrefix: process.env.REDIS_KEY_PREFIX ?? 'plsp:',
};
