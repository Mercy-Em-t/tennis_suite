import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    // This is a lightweight, high-frequency endpoint for the SWR listener.
    // It purposefully does not run heavy auth checks for speed, as it only returns a status enum.
    
    let state = 'NORMAL';
    let message = '';
    let globalMessage = null;

    if (tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { globalState: true, globalMessage: true }
      });
      if (tournament?.globalState === 'SUSPENDED') {
        state = 'SUSPENDED';
      }
      globalMessage = tournament?.globalMessage;
    } else {
      // Check if ANY active tournament is suspended (for the global Host/Delegate view)
      const activeTournaments = await prisma.tournament.findMany({
        where: { isActive: true },
        select: { globalState: true, globalMessage: true }
      });
      
      const suspended = activeTournaments.find(t => t.globalState === 'SUSPENDED');
      if (suspended) state = 'SUSPENDED';
      
      const msgTournament = activeTournaments.find(t => t.globalMessage);
      if (msgTournament) globalMessage = msgTournament.globalMessage;
    }

    // Get the latest audit log to fetch the reason for the suspension overlay
    if (state === 'SUSPENDED') {
      const latestAudit = await prisma.auditLog.findFirst({
        where: { 
          action: 'TOURNAMENT_SUSPENDED',
          ...(tournamentId ? { tournamentId } : {})
        },
        orderBy: { createdAt: 'desc' }
      });
      
      message = latestAudit?.details || 'Emergency Suspension Active';
    }

    return NextResponse.json({ state, message, globalMessage });
  } catch (error) {
    console.error('System Status API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
