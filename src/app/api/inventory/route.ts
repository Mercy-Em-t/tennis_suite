import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 33: Equipment Inventory & Asset Tracking
 * Manages checking out Broadcast gear and tracking Tennis Ball lifecycles.
 */
export async function POST(request: Request) {
  try {
    const { action, itemId, staffId, setsPlayedIncrement } = await request.json();

    if (action === 'CHECKOUT_EQUIPMENT') {
      const equipment = await prisma.equipment.update({
        where: { id: itemId },
        data: { status: 'IN_USE', checkedOutBy: staffId }
      });
      return NextResponse.json({ success: true, equipment });
    }

    if (action === 'LOG_BALL_USAGE') {
      const ball = await prisma.ballCan.update({
        where: { id: itemId },
        data: { setsPlayed: { increment: setsPlayedIncrement } }
      });
      
      // Auto-retire logic
      if (ball.setsPlayed >= 3) {
        await prisma.ballCan.update({
          where: { id: itemId },
          data: { status: 'RETIRED' }
        });
        return NextResponse.json({ success: true, message: 'Balls reached lifecycle limit. Retired.' });
      }
      return NextResponse.json({ success: true, ball });
    }

    return NextResponse.json({ error: 'Invalid inventory action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process inventory request' }, { status: 400 });
  }
}
