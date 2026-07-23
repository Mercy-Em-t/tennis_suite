/**
 * ============================================================
 *  PAYMENT PROCESSOR STUB
 *  Location : src/lib/stubs/payment_processor.stub.ts
 *  SRS Ref  : docs/SRS/stubs/payment_processor.md
 *  Status   : STUB – NOT WIRED. Replace with real provider SDK.
 * ============================================================
 *
 * This file is the authoritative connection plug-in point for
 * any payment processor used by Tennis Suite (e.g. Stripe,
 * M-Pesa, PayPal). Swap only this file when wiring a provider.
 *
 * HOW TO WIRE:
 *   1. Install your provider SDK  (e.g. `npm i stripe`)
 *   2. Implement each method below with real logic.
 *   3. Delete the "STUB" comment block and the simulated returns.
 *   4. Update docs/SRS/stubs/payment_processor.md with provider
 *      name and environment variables.
 */

// ─────────────────────────────────────────────
//  ATTRIBUTES  (environment config)
// ─────────────────────────────────────────────
export const PAYMENT_PROVIDER_NAME: string   = process.env.PAYMENT_PROVIDER_NAME   ?? 'STUB';
export const PAYMENT_API_KEY: string         = process.env.PAYMENT_API_KEY          ?? '';
export const PAYMENT_WEBHOOK_SECRET: string  = process.env.PAYMENT_WEBHOOK_SECRET   ?? '';
export const PAYMENT_BASE_URL: string        = process.env.PAYMENT_BASE_URL         ?? 'https://stub.payments.local';
export const PAYMENT_CURRENCY: string        = process.env.PAYMENT_CURRENCY         ?? 'KES';

// ─────────────────────────────────────────────
//  TYPES / INTERFACES
// ─────────────────────────────────────────────

/** A charge request sent to the payment processor. */
export interface PaymentChargeRequest {
  /** Customer's unique ID in Tennis Suite */
  customerId: string;
  /** Amount in smallest currency unit (e.g. cents / ngozi) */
  amountMinorUnits: number;
  currency: string;
  /** Human-readable description e.g. "Court fee – Court 3, 14:00" */
  description: string;
  /** Idempotency key to prevent double-charges */
  idempotencyKey: string;
  metadata?: Record<string, string>;
}

/** Response returned after a charge attempt. */
export interface PaymentChargeResult {
  success: boolean;
  transactionId: string;
  status: 'succeeded' | 'pending' | 'failed';
  providerRaw?: unknown;   // raw provider response for logging
}

/** Represents a refund request. */
export interface PaymentRefundRequest {
  transactionId: string;
  amountMinorUnits?: number; // partial refund if specified
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
}

/** Incoming webhook event from the payment provider. */
export interface PaymentWebhookEvent {
  eventType: string;
  transactionId: string;
  payload: unknown;
}

// ─────────────────────────────────────────────
//  METHODS  (stub implementations)
// ─────────────────────────────────────────────

/**
 * Initialise / authenticate against the payment provider.
 * Called once at application startup or first use.
 */
export async function initPaymentProcessor(): Promise<void> {
  console.warn(`[PaymentStub] initPaymentProcessor called. Provider: ${PAYMENT_PROVIDER_NAME}. NOT WIRED.`);
  // TODO: Initialise SDK e.g.  const stripe = new Stripe(PAYMENT_API_KEY)
}

/**
 * Charge a customer for a court fee, tournament entry, etc.
 */
export async function chargeCustomer(req: PaymentChargeRequest): Promise<PaymentChargeResult> {
  console.warn('[PaymentStub] chargeCustomer called. Returning simulated success.', req);
  // TODO: Call provider charge/intent API
  return {
    success: true,
    transactionId: `stub_txn_${Date.now()}`,
    status: 'succeeded',
  };
}

/**
 * Refund a previous transaction (full or partial).
 */
export async function refundTransaction(req: PaymentRefundRequest): Promise<PaymentRefundResult> {
  console.warn('[PaymentStub] refundTransaction called. Returning simulated success.', req);
  // TODO: Call provider refund API
  return {
    success: true,
    refundId: `stub_rfnd_${Date.now()}`,
    status: 'succeeded',
  };
}

/**
 * Verify and parse an inbound webhook event from the provider.
 * Validates signature to prevent spoofing.
 */
export async function parseWebhookEvent(
  rawBody: string,
  signature: string,
): Promise<PaymentWebhookEvent> {
  console.warn('[PaymentStub] parseWebhookEvent called. Signature check SKIPPED in stub.');
  // TODO: Verify HMAC signature with PAYMENT_WEBHOOK_SECRET
  return {
    eventType: 'stub.payment.succeeded',
    transactionId: `stub_txn_${Date.now()}`,
    payload: JSON.parse(rawBody),
  };
}
