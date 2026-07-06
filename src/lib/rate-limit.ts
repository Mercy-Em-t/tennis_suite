import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Shared Redis client for all rate limiters.
 * Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in the environment.
 */
const redisUrl = process.env.UPSTASH_REDIS_REST_URL || '';
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';
const redis = redisUrl.startsWith('https')
  ? new Redis({ url: redisUrl, token: redisToken })
  : new Redis({ url: 'https://mock.upstash.io', token: 'mock' });

/**
 * Checkout limiter — 10 requests per user/IP per 60-second sliding window.
 * Protects against billing abuse on the Stripe checkout initiation endpoint.
 */
export const checkoutLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '60 s'),
  analytics: true,
  prefix: 'ratelimit:checkout',
});

/**
 * AI limiter — 20 requests per user/IP per 60-second sliding window.
 * Protects against runaway LLM token spend on AI generation endpoints.
 */
export const aiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '60 s'),
  analytics: true,
  prefix: 'ratelimit:ai',
});

/**
 * General API limiter — 60 requests per user/IP per 60-second sliding window.
 * Broad protection for other sensitive endpoints.
 */
export const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '60 s'),
  analytics: true,
  prefix: 'ratelimit:api',
});

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
