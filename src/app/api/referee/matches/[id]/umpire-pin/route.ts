import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { requireAuth } from '@/lib/auth/require-auth';



function generatePIN() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const authResult = await requireAuth(['HOST', 'REFEREE']);
    if (authResult instanceof NextResponse) return authResult;

    const { action } = await request.json(); // "GENERATE" or "REVOKE"

    if (action === 'GENERATE') {
      const pin = generatePIN();
      const updatedMatch = await prisma.match.update({
        where: { id: params.id },
        data: { umpireCode: pin }
      });
      return NextResponse.json({ success: true, pin: updatedMatch.umpireCode });
    } 
    
    if (action === 'REVOKE') {
      await prisma.match.update({
        where: { id: params.id },
        data: { umpireCode: null, umpireId: null }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('[referee/umpire-pin]', error);
    return NextResponse.json({ error: 'Failed to update Umpire PIN' }, { status: 500 });
  }
}
