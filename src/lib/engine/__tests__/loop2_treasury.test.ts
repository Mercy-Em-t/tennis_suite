import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as stripeWebhook } from '@/app/api/webhooks/stripe/route';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
  }
}));

// Mock Stripe so we can intercept constructEvent
vi.mock('stripe', () => {
  const constructEvent = vi.fn();
  return {
    default: class StripeMock {
      webhooks = { constructEvent };
    }
  };
});

const createRequest = (body: string, signature?: string) => {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body,
    headers: new Headers({
      'stripe-signature': signature || ''
    })
  });
};

describe('Loop 2: Monthly Financial Ledger (The Treasury)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Webhook Audit', () => {
    it('rejects fraudulent payloads when the signature is invalid or missing', async () => {
      // Force production env so the dummy fallback doesn't bypass signature checking
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      vi.stubEnv('NODE_ENV', 'production');
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_prod_dummy';

      // We don't need to mock constructEvent since Stripe is already mocked,
      // it will throw an error if we set it up to throw
      const stripeInstance = new Stripe('dummy');
      vi.mocked(stripeInstance.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const req = createRequest(JSON.stringify({ data: 'fake' }), 'invalid-signature');
      const res = await stripeWebhook(req);
      const data = await res.json();

      vi.unstubAllEnvs();
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;

      expect(res.status).toBe(400);
      expect(data.error).toContain('Webhook Error: Invalid signature');
    });
  });

  describe('Split-Transaction Balancing', () => {
    it('mathematically balances grossAmount, platformFee, and hostPayout without discrepancies', async () => {
      const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
      vi.stubEnv('NODE_ENV', 'production');
      process.env.STRIPE_WEBHOOK_SECRET = 'whsec_prod_dummy';

      const sessionEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            amount_total: 10000, // $100.00
            metadata: {
              teamId: 'team_1',
              tournamentId: 'tourney_1',
            }
          }
        }
      };

      const stripeInstance = new Stripe('dummy');
      vi.mocked(stripeInstance.webhooks.constructEvent).mockReturnValue(sessionEvent as any);

      let txAssertionsRun = false;

      // Mock prisma.$transaction to simulate the exact callback execution
      (prisma.$transaction as any).mockImplementation(async (callback: any) => {
        const tx = {
          team: { update: vi.fn().mockResolvedValue({ id: 'team_1' }) },
          rainmakerFee: { create: vi.fn().mockResolvedValue({}) },
          partnerPayout: { create: vi.fn().mockResolvedValue({}) },
          ledgerEntry: { create: vi.fn().mockResolvedValue({}) }
        };
        const result = await callback(tx);
        
        // Assertions inside the transaction callback validation
        const totalAmount = 10000;
        const rainmakerPercent = 0.10;
        const partnerPercent = 0.05;
        
        const rainmakerAmount = Math.round(totalAmount * rainmakerPercent);
        const partnerAmount = Math.round(totalAmount * partnerPercent);
        const hostPayout = totalAmount - rainmakerAmount - partnerAmount;

        // VERIFY: Split-Transaction Balancing
        expect(rainmakerAmount + partnerAmount + hostPayout).toBe(totalAmount);
        
        expect(tx.rainmakerFee.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ dealAmount: totalAmount, payoutAmount: rainmakerAmount })
        }));

        expect(tx.partnerPayout.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ amountOwed: partnerAmount })
        }));

        expect(tx.ledgerEntry.create).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({
            grossAmount: totalAmount,
            platformFee: rainmakerAmount + partnerAmount,
            hostPayout: hostPayout
          })
        }));

        txAssertionsRun = true;
        return result;
      });

      const req = createRequest(JSON.stringify(sessionEvent), 'valid-signature');
      const res = await stripeWebhook(req);

      vi.unstubAllEnvs();
      process.env.STRIPE_WEBHOOK_SECRET = originalSecret;

      expect(res.status).toBe(200);
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(txAssertionsRun).toBe(true);
    });
  });
});
