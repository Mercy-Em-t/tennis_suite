# Payment Processor Stub

> **Code Stub →** [`src/lib/stubs/payment_processor.stub.ts`](../../../src/lib/stubs/payment_processor.stub.ts)  
> **Registry →** [`src/lib/stubs/index.ts`](../../../src/lib/stubs/index.ts)

## Overview
- **Purpose**: Handles transactions for court fees, tournament entries, and rainmaker fees.
- **Connection**: Swap the code stub file to wire a real provider (e.g. Stripe, M-Pesa).

## Attributes (Environment Variables)
| Variable | Default | Description |
|---|---|---|
| `PAYMENT_PROVIDER_NAME` | `STUB` | Human-readable provider label |
| `PAYMENT_API_KEY` | `` | Provider API/secret key |
| `PAYMENT_WEBHOOK_SECRET` | `` | HMAC secret for webhook verification |
| `PAYMENT_BASE_URL` | `https://stub.payments.local` | Provider base URL |
| `PAYMENT_CURRENCY` | `KES` | Default transaction currency |

## Interfaces
- `PaymentChargeRequest` — customer ID, amount, currency, description, idempotency key
- `PaymentChargeResult` — success flag, transactionId, status
- `PaymentRefundRequest` — transactionId, optional partial amount
- `PaymentRefundResult` — success flag, refundId, status
- `PaymentWebhookEvent` — eventType, transactionId, raw payload

## Methods
| Method | Signature | Description |
|---|---|---|
| `initPaymentProcessor` | `() → Promise<void>` | Initialise / authenticate SDK |
| `chargeCustomer` | `(req: PaymentChargeRequest) → Promise<PaymentChargeResult>` | Charge a customer |
| `refundTransaction` | `(req: PaymentRefundRequest) → Promise<PaymentRefundResult>` | Full or partial refund |
| `parseWebhookEvent` | `(body, sig) → Promise<PaymentWebhookEvent>` | Verify & parse inbound webhook |

## Data Models
Links to `RainmakerFee` and `PartnerPayout` Prisma models.

*(Replace stub methods with real SDK calls to wire this service.)*
