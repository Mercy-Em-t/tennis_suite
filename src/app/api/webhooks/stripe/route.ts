import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-06-24.dahlia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';


export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error('No signature provided');
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature error';
    console.error(`Webhook Error: ${message}`);
    // If using a dummy secret in dev, bypass verification to allow local mocking
    if (process.env.NODE_ENV === 'development' && endpointSecret === 'whsec_dummy') {
      console.warn("Bypassing Stripe signature verification in dev with dummy secret.");
      event = JSON.parse(body);
    } else {
      return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const teamId = session.metadata?.teamId;
    const totalAmount = session.amount_total || 0; // In cents

    if (teamId) {
      try {
        // Atomic transaction for updating the team and allocating ledger funds
        await prisma.$transaction(async (tx) => {
          // 1. Update Team to REGISTERED
          await tx.team.update({
            where: { id: teamId },
            data: { paymentStatus: 'REGISTERED' }
          });

          // 2. Calculate Revenue Splits (Hardcoded constants for now)
          // 10% broker fee for Rainmaker and 5% Partner Payout for videography overhead
          const rainmakerFeePercent = 0.10;
          const partnerPayoutPercent = 0.05;

          const rainmakerAmount = Math.round(totalAmount * rainmakerFeePercent);
          const partnerAmount = Math.round(totalAmount * partnerPayoutPercent);

          // 3. Write to RainmakerFee ledger
          if (rainmakerAmount > 0) {
            await tx.rainmakerFee.create({
              data: {
                brokerName: "Tennis Suite Platform",
                dealAmount: totalAmount,
                feePercent: rainmakerFeePercent,
                payoutAmount: rainmakerAmount
              }
            });
          }

          // 4. Write to PartnerPayout ledger
          if (partnerAmount > 0) {
            await tx.partnerPayout.create({
              data: {
                partnerName: "Broadcasting / Videography Team",
                service: "MEDIA_AND_TELEMETRY",
                amountOwed: partnerAmount,
                status: "PENDING"
              }
            });
          }
        });
        console.log(`[Stripe Webhook] Successfully registered team ${teamId} and recorded splits.`);
      } catch (txError) {
        console.error('[Stripe Webhook] Transaction failed:', txError);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
