import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchEventEmitter } from '@/lib/eventEmitter';

export async function POST(request: Request) {
  try {
    const { currentDirectorId, newDirectorId } = await request.json();

    if (!newDirectorId) {
      return NextResponse.json({ error: 'newDirectorId is required' }, { status: 400 });
    }

    const newDirector = await prisma.user.findUnique({ where: { id: newDirectorId } });
    
    if (!newDirector) {
      return NextResponse.json({ error: 'Director not found' }, { status: 404 });
    }

    // In a real app, we'd update a Tournament's activeDirectorId or ShiftLog.
    // Here we emit a zero-downtime event to update the global dashboard state.
    matchEventEmitter.emit('SHIFT_HANDOVER', {
      previousDirectorId: currentDirectorId,
      activeDirector: {
        id: newDirector.id,
        name: newDirector.name,
        email: newDirector.email
      },
      timestamp: Date.now()
    });

    return NextResponse.json({
      success: true,
      message: `Shift successfully transferred to ${newDirector.name}.`,
      activeDirector: newDirector
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
