import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { requireAuth } from '@/lib/auth/require-auth';
import { checkoutLimiter, getIpIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

// Safe initialization if ENV vars aren't fully configured yet
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2026-06-24.dahlia',
});



export async function POST(request: Request) {
  // Layer 8: Require authenticated session
  const authResult = await requireAuth(['PLAYER', 'HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  // Layer 9: Rate limiting — 10 checkout initiations per IP per 60 seconds
  const ip = getIpIdentifier(request);
  const { success, limit, remaining } = await checkoutLimiter.limit(ip);
  if (!success) {
    logger.warn('[checkout] Rate limit exceeded', { ip, limit });
    return NextResponse.json(
      { error: 'Too many requests. Please wait before trying again.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'Retry-After': '60',
        },
      }
    );
  }

  try {
    const { teamId, addons } = await request.json();

    if (!teamId) {
      return NextResponse.json({ error: 'teamId is required' }, { status: 400 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { tournament: true }
    });

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    if (team.paymentStatus === 'REGISTERED') {
      return NextResponse.json({ error: 'Team is already registered and paid.' }, { status: 400 });
    }

    // Base tournament entry fee
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Tournament Entry: ${team.tournament.name}`,
            description: `Registration fee for ${team.franchiseName}`,
          },
          unit_amount: 5000, // $50.00
        },
        quantity: 1,
      }
    ];

    // Premium Upsells (Telemetry & Customized Gear)
    if (addons?.includes('HIGH_RES_TELEMETRY')) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'High-Res Match Telemetry',
            description: 'Post-match analytics and cinematic AI highlights',
          },
          unit_amount: 1500, // $15.00
        },
        quantity: 1,
      });
    }

    if (addons?.includes('CUSTOM_GEAR')) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Customized Team Gear',
            description: 'Premium moisture-wicking team shirts',
          },
          unit_amount: 3000, // $30.00
        },
        quantity: 1,
      });
    }

    const origin = request.headers.get('origin') || 'https://sports.tmsavannah.com';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel`,
      metadata: {
        teamId: team.id,
        tournamentId: team.tournamentId,
      },
    });

    if (session.id) {
      // Update team with the pending Stripe Session ID
      await prisma.team.update({
        where: { id: team.id },
        data: { stripeSessionId: session.id }
      });
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    logger.error('[checkout/session] Stripe session creation failed', { userId: typeof authResult === 'object' ? authResult.id : undefined }, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
