import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Shared Redis client for all rate limiters.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the environment.
 */
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const isRedisConfigured = redisUrl.startsWith('https');

const redis = isRedisConfigured
  ? new Redis({ url: redisUrl, token: redisToken })
  : (null as unknown as Redis); // We won't use it if not configured

// Dummy limiter for local dev
const dummyLimiter: any = {
  limit: async () => ({ success: true, limit: 100, remaining: 99, reset: 0 })
};

/**
 * Checkout limiter — 10 requests per user/IP per 60-second sliding window.
 * Protects against billing abuse on the Stripe checkout initiation endpoint.
 */
export const checkoutLimiter = isRedisConfigured ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:checkout',
}) : dummyLimiter;

/**
 * AI limiter — 20 requests per user/IP per 60-second sliding window.
 * Protects against runaway LLM token spend on AI generation endpoints.
 */
export const aiLimiter = isRedisConfigured ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  analytics: true,
  prefix: 'ratelimit:ai',
}) : dummyLimiter;

/**
 * General API limiter — 60 requests per user/IP per 60-second sliding window.
 * Broad protection for other sensitive endpoints.
 */
export const apiLimiter = isRedisConfigured ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: true,
  prefix: 'ratelimit:api',
}) : dummyLimiter;

/**
 * Login limiter — 5 requests per user/IP per 5-minute sliding window.
 * Protects against brute-force credential stuffing on the auth endpoint.
 */
export const loginLimiter = isRedisConfigured ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'),
  analytics: true,
  prefix: 'ratelimit:login',
}) : dummyLimiter;

/**
 * Extracts the best available IP identifier from a Request.
 * Falls back to a constant so rate limiting degrades gracefully in local dev.
 */
export function getIpIdentifier(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}
