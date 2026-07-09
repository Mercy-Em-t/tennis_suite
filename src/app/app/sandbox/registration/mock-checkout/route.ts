import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// This is a dev-only route that simulates a user completing checkout on Stripe's hosted page,
// and then hitting our webhook manually.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('teamId');
  const tournamentId = searchParams.get('tournamentId');

  if (!teamId || !tournamentId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  // Construct a mock Stripe Webhook Payload
  const mockPayload = {
    id: "evt_test_123",
    object: "event",
    type: "checkout.session.completed",
    data: {
      object: {
        id: "cs_test_mock",
        object: "checkout.session",
        amount_total: 5000,
        metadata: {
          teamId,
          tournamentId,
          grossAmount: "5000"
        }
      }
    }
  };

  try {
    // Determine our own base URL to hit the webhook
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const webhookUrl = `${protocol}://${host}/api/webhooks/stripe`;

    // Fire the webhook locally
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // In our webhook, if 'stripe-signature' is missing but we're in dev, it bypasses.
      },
      body: JSON.stringify(mockPayload)
    });

    if (!res.ok) {
      throw new Error(`Webhook responded with status ${res.status}`);
    }

    // Redirect the user back to the portal with success=true
    return NextResponse.redirect(`${protocol}://${host}/sandbox/registration?success=true&teamId=${teamId}`);

  } catch (error: any) {
    logger.error('Mock Checkout Simulation Failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
