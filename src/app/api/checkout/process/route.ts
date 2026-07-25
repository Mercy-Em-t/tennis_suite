import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { initiateStkPush } from '@/lib/mpesa';

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { tournamentId, franchiseName, paymentMethod, phoneNumber, categories } = await request.json();

    if (!tournamentId || !franchiseName || !paymentMethod) {
      return NextResponse.json({ error: 'Missing checkout context' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });

    // 1. Double Billing Prevention
    const existingTeam = await prisma.team.findFirst({
      where: {
        tournamentId,
        franchiseName,
        paymentStatus: 'REGISTERED'
      }
    });

    if (existingTeam) {
      return NextResponse.json({ error: 'This team has already paid and is registered for the tournament.' }, { status: 400 });
    }

    let transactionId = '';

    // 2. M-Pesa Specific Logic
    if (paymentMethod === 'MPESA') {
      if (!phoneNumber) {
        return NextResponse.json({ error: 'M-Pesa requires a phone number.' }, { status: 400 });
      }

      // Hardcoded checkout amount for MVP (usually fetched from DB)
      const amount = 157.50; 
      // Need a public URL for callback, defaulting to the host or a dummy local URL for testing
      const hostUrl = request.headers.get('origin') || 'https://tennissuite.app';
      const callbackUrl = `${hostUrl}/api/checkout/mpesa/callback`;

      try {
        const gatewayRes = await fetch('https://pay.tmsavannah.com/api/mpesa-initiate', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GATEWAY_API_KEY}`
          },
          body: JSON.stringify({
            source_app: 'sports',
            source_reference: franchiseName.substring(0, 12).replace(/[^a-zA-Z0-9]/g, ''),
            amount,
            phone_number: phoneNumber,
            webhook_url: callbackUrl
          })
        });
        
        const mpesaRes = await gatewayRes.json();
        if (!gatewayRes.ok || !mpesaRes.success) {
          throw new Error(mpesaRes.error || mpesaRes.message || 'STK Push Failed.');
        }
      } catch (err: any) {
        return NextResponse.json({ error: err.message || 'STK Push Failed. Check your phone number.' }, { status: 400 });
      }

      // 3. Create Team Record as PENDING_PAYMENT
      const team = await prisma.team.create({
        data: {
          franchiseName,
          tournamentId,
          categories: JSON.stringify(categories || []),
          paymentStatus: 'PENDING_PAYMENT',
          players: { connect: { id: user!.id } }
        }
      });

      return NextResponse.json({
        success: true,
        paymentProvider: 'MPESA',
        message: 'STK Push initiated. Please check your phone to enter your PIN.',
        transactionId: team.id
      });
    } else if (paymentMethod === 'STRIPE') {
      // Mock Stripe ID
      transactionId = 'pi_mock_' + Math.random().toString(36).substr(2, 9);
    }

    const ENTRY_FEE = 15000; // in cents ($150)
    const PLATFORM_FEE_PERCENT = 5.0;
    const platformCut = ENTRY_FEE * (PLATFORM_FEE_PERCENT / 100);
    const hostPayout = ENTRY_FEE - platformCut;

    // 3. Atomic Database Ledgering
    await prisma.$transaction(async (tx) => {
      // Find existing pending team or create a new one
      let team = await tx.team.findFirst({
        where: { tournamentId, franchiseName }
      });

      if (team) {
        team = await tx.team.update({
          where: { id: team.id },
          data: { 
            paymentStatus: 'REGISTERED',
            stripeSessionId: transactionId,
            categories: JSON.stringify(categories || [])
          }
        });
      } else {
        team = await tx.team.create({
          data: {
            franchiseName,
            tournamentId,
            paymentStatus: 'REGISTERED',
            stripeSessionId: transactionId,
            categories: JSON.stringify(categories || []),
            players: { connect: { id: payload.sub } }
          }
        });
      }

      // Create the ledger entry
      await tx.ledgerEntry.create({
        data: {
          tournamentId,
          teamId: team.id,
          grossAmount: ENTRY_FEE,
          platformFee: platformCut,
          hostPayout: hostPayout
        }
      });

      // Platform Rainmaker Fee
      await tx.rainmakerFee.create({
        data: {
          tournamentId,
          brokerName: paymentMethod === 'MPESA' ? 'Daraja M-Pesa (Mock)' : 'Stripe Gateway (Mock)',
          dealAmount: ENTRY_FEE,
          feePercent: PLATFORM_FEE_PERCENT,
          payoutAmount: platformCut
        }
      });

      // Mock Partner Payout (e.g., local club gets 10%)
      await tx.partnerPayout.create({
        data: {
          tournamentId,
          partnerName: 'Local Country Club',
          service: 'FACILITY_FEE',
          amountOwed: ENTRY_FEE * 0.10,
          status: 'PENDING'
        }
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 5000,
      timeout: 10000
    });

    // Simulate firing off a Registration Success & Magic Link email
    console.log(`[EMAIL DISPATCH] To: ${user?.email}`);
    console.log(`[EMAIL DISPATCH] Subject: Registration Confirmed for ${tournament?.name}`);
    console.log(`[EMAIL DISPATCH] Body: You are officially registered for ${tournament?.name}! Access your Player Hub and set up your account here: https://tennissuite.com/magic-link?token=abc123_mock`);

    return NextResponse.json({ 
      success: true, 
      message: 'Payment received. Registration successful!',
      transactionId,
      emailSent: true,
      magicLink: 'https://tennissuite.com/magic-link?token=abc123_mock'
    });
  } catch (error) {
    console.error('[checkout/process/POST]', error);
    return NextResponse.json({ error: 'Payment processing failed. Please try again.' }, { status: 500 });
  }
}
