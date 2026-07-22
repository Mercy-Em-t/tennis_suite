import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const isRedisConfigured = redisUrl.startsWith('https');

/**
 * Shared Upstash Redis client.
 */
export const redis = isRedisConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : (null as unknown as Redis);
