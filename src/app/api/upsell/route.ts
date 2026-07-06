import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';



export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { itemName, size, quantity } = await request.json();

    if (!itemName) {
      return NextResponse.json({ error: 'Missing item details' }, { status: 400 });
    }

    // Identify the user's primary team to link the pre-order
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { teams: true }
    });

    if (!user || user.teams.length === 0) {
      return NextResponse.json({ error: 'You must belong to a team to place an order.' }, { status: 400 });
    }

    const teamId = user.teams[0].id; // Assign to first team for MVP

    const preOrder = await prisma.preOrder.create({
      data: {
        teamId,
        itemName,
        size: size || 'N/A',
        quantity: parseInt(quantity) || 1
      }
    });

    // Mock Ledgers for upsell
    await prisma.rainmakerFee.create({
      data: {
        brokerName: 'Stripe Gateway (Upsell)',
        dealAmount: 50, // Mock fixed $50 upsell price
        feePercent: 5.0,
        payoutAmount: 2.50
      }
    });

    return NextResponse.json({ success: true, message: 'Upsell purchase complete', preOrder });
  } catch (error) {
    console.error('[upsell/POST]', error);
    return NextResponse.json({ error: 'Purchase processing failed' }, { status: 500 });
  }
}
