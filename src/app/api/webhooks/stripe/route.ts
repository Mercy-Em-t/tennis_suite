import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { matchEventEmitter } from '@/lib/eventEmitter';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2025-02-24.acacia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!sig) throw new Error('No signature provided');
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook signature error';
    console.error(`Webhook Error: ${message}`);
    if (process.env.NODE_ENV === 'development' || endpointSecret === 'whsec_dummy') {
      console.warn("Bypassing Stripe signature verification in dev with dummy secret.");
      event = JSON.parse(body);
    } else {
      return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
    }
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const teamId = session.metadata?.teamId;
    const tournamentId = session.metadata?.tournamentId;
    const totalAmount = session.amount_total || parseInt(session.metadata?.grossAmount || '0') || 0;

    if (teamId && tournamentId) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          // 1. Update Team to REGISTERED
          const updatedTeam = await tx.team.update({
            where: { id: teamId },
            data: { 
              paymentStatus: 'REGISTERED',
              stripeSessionId: session.id
            }
          });

          // 2. Calculate Revenue Splits
          const rainmakerFeePercent = 0.10;
          const partnerPayoutPercent = 0.05;

          const rainmakerAmount = Math.round(totalAmount * rainmakerFeePercent);
          const partnerAmount = Math.round(totalAmount * partnerPayoutPercent);
          const hostPayout = totalAmount - rainmakerAmount - partnerAmount;

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
                tournamentId: tournamentId,
                partnerName: "Broadcasting / Videography Team",
                service: "MEDIA_AND_TELEMETRY",
                amountOwed: partnerAmount,
                status: "PENDING"
              }
            });
          }

          // 5. Write to the new LedgerEntry table (Stage 9 Requirement)
          await tx.ledgerEntry.create({
            data: {
              tournamentId,
              teamId,
              grossAmount: totalAmount,
              platformFee: rainmakerAmount + partnerAmount,
              hostPayout: hostPayout
            }
          });

          return { team: updatedTeam };
        });
        
        console.log(`[Stripe Webhook] Successfully registered team ${teamId} and recorded ledger entry.`);

        // 6. Broadcast SSE Event to Host Dashboard (SLOT_OCCUPIED)
        matchEventEmitter.emit(`registrationUpdated:${tournamentId}`, {
          type: 'SLOT_OCCUPIED',
          team: result.team
        });

      } catch (txError) {
        console.error('[Stripe Webhook] Transaction failed:', txError);
        return NextResponse.json({ error: 'Database transaction failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
