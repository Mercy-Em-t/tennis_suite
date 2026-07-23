/**
 * ============================================================
 *  STUB REGISTRY
 *  Location : src/lib/stubs/index.ts
 *  SRS Ref  : docs/SRS/stubs/
 *  Status   : REGISTRY – Safe to import anywhere in the app.
 * ============================================================
 *
 * This is the SINGLE import point for all external service stubs.
 * When a stub is wired to a real provider, only the individual
 * stub file changes. All consumers of this registry require
 * zero changes.
 *
 * USAGE EXAMPLE:
 *   import { PaymentProcessor, CalendarService, NotificationService } from '@/lib/stubs';
 *
 *   await PaymentProcessor.chargeCustomer({ ... });
 *   await CalendarService.bookResource({ ... });
 *   await NotificationService.sendRefereeAlert({ ... });
 */

// ─────────────────────────────────────────────
//  RE-EXPORTS (individual stubs)
// ─────────────────────────────────────────────

export * as PaymentProcessor    from './payment_processor.stub';
export * as CalendarService     from './calendar_service.stub';
export * as NotificationService from './notification_service.stub';

// ─────────────────────────────────────────────
//  STUB STATUS MAP
//  Useful for a /api/health or admin diagnostics endpoint.
// ─────────────────────────────────────────────

export const STUB_REGISTRY = {
  payment: {
    name:    process.env.PAYMENT_PROVIDER_NAME   ?? 'STUB',
    wired:   !!(process.env.PAYMENT_API_KEY),
    srsDoc:  'docs/SRS/stubs/payment_processor.md',
    srcFile: 'src/lib/stubs/payment_processor.stub.ts',
  },
  calendar: {
    name:    process.env.CALENDAR_PROVIDER_NAME  ?? 'STUB',
    wired:   !!(process.env.CALENDAR_API_KEY),
    srsDoc:  'docs/SRS/stubs/calendar_service.md',
    srcFile: 'src/lib/stubs/calendar_service.stub.ts',
  },
  notification: {
    name:    process.env.EMAIL_PROVIDER_NAME     ?? 'STUB',
    wired:   !!(process.env.EMAIL_API_KEY),
    srsDoc:  'docs/SRS/stubs/notification_service.md',
    srcFile: 'src/lib/stubs/notification_service.stub.ts',
  },
} as const;

/** Returns a list of stubs that are NOT yet wired to a real provider. */
export function getUnwiredStubs(): string[] {
  return Object.entries(STUB_REGISTRY)
    .filter(([, v]) => !v.wired)
    .map(([k]) => k);
}
