import * as Sentry from '@sentry/nextjs';

type LogContext = Record<string, unknown>;

/**
 * Structured logger for the Tennis Suite.
 *
 * - In production: streams JSON to stdout (captured by Vercel log drains) and
 *   forwards errors + exceptions to Sentry.
 * - In development: logs human-readable output to the console.
 *
 * Usage:
 *   import { logger } from '@/lib/logger';
 *   logger.info('Match score updated', { matchId, scoringTeam });
 *   logger.error('Stripe webhook failed', { event: evt.type }, err);
 */
const isDev = process.env.NODE_ENV !== 'production';

function formatDev(level: string, msg: string, ctx?: LogContext): string {
  const ctxStr = ctx ? ` ${JSON.stringify(ctx)}` : '';
  return `[${level.toUpperCase()}] ${msg}${ctxStr}`;
}

export const logger = {
  info(msg: string, ctx?: LogContext): void {
    if (isDev) {
      console.log(formatDev('info', msg, ctx));
    } else {
      console.log(JSON.stringify({ level: 'info', service: 'tennis-suite', msg, ...ctx }));
    }
  },

  warn(msg: string, ctx?: LogContext): void {
    if (isDev) {
      console.warn(formatDev('warn', msg, ctx));
    } else {
      console.warn(JSON.stringify({ level: 'warn', service: 'tennis-suite', msg, ...ctx }));
    }
  },

  error(msg: string, ctx?: LogContext, err?: unknown): void {
    if (isDev) {
      console.error(formatDev('error', msg, ctx), err ?? '');
    } else {
      console.error(JSON.stringify({ level: 'error', service: 'tennis-suite', msg, ...ctx }));
    }

    // Always forward errors to Sentry in any environment if an exception is provided
    if (err) {
      Sentry.captureException(err, {
        extra: { ...ctx, msg },
      });
    }
  },
};
