import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !['HOST', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find all users belonging to teams in this tournament
    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        teams: {
          include: { players: true }
        }
      }
    });

    if (!tournament) return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });

    // Mock Communication Highway
    let sentCount = 0;
    for (const team of tournament.teams) {
      for (const player of team.players) {
        // In a real environment, send via AWS SES or SendGrid here
        console.log(`[Communication Highway] -> Email sent to ${player.email}: "You have been registered for ${tournament.name}. Login at /login to view your Walled Garden."`);
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully broadcasted invites to ${sentCount} players.` });
  } catch (error) {
    console.error('[tournaments/broadcast/POST]', error);
    return NextResponse.json({ error: 'Failed to broadcast invites' }, { status: 500 });
  }
}
