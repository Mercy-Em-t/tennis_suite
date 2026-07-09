import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { logger } from '@/lib/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock', {
  apiVersion: '2026-06-24.dahlia',
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
    const { teamId } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
    if (!tournament) throw new Error('Tournament not found');

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team || team.tournamentId !== tournamentId) {
      throw new Error('Invalid team for this tournament');
    }

    if (team.paymentStatus === 'REGISTERED') {
      throw new Error('Team has already paid.');
    }

    // Rainmaker Financial Logic
    const grossAmount = 5000; // $50.00
    
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // If we don't have a real Stripe Key configured, we will simulate the checkout session return URL
    // so the "Rainmaker" pulse test can still be executed by the developer manually hitting the webhook.
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('STRIPE_SECRET_KEY is missing. Simulating checkout session generation.');
      return NextResponse.json({
        success: true,
        // Instead of a real Stripe URL, we redirect to a mock gateway in our sandbox
        url: `${origin}/sandbox/registration/mock-checkout?teamId=${teamId}&tournamentId=${tournamentId}`
      });
    }

    // Real Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Registration: ${tournament.name}`,
              description: `Entry fee for team: ${team.franchiseName}`,
            },
            unit_amount: grossAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/sandbox/registration?success=true&teamId=${team.id}`,
      cancel_url: `${origin}/sandbox/registration?canceled=true`,
      metadata: {
        tournamentId,
        teamId,
        grossAmount: grossAmount.toString(),
      }
    });

    return NextResponse.json({
      success: true,
      url: session.url
    });

  } catch (error: any) {
    logger.error('[tournaments/checkout/POST]', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
