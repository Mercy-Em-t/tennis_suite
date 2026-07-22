import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { verifyToken } from '@/lib/auth';
import { sendRawEmail } from '@/lib/mail/dispatch';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !payload.roles.some(r => ['HOST', 'ADMIN'].includes(r))) {
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

    // Send entry list notification
    let sentCount = 0;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sports.tmsavannah.com';
    const loginLink = `${origin}/login`;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #1e3a8a;">🎾 Entry List Published: ${tournament.name}</h2>
        <p>You have successfully secured your spot in <strong>${tournament.name}</strong>!</p>
        <p>The Walled Garden is now open. You can view the official entry list and interact with other players.</p>
        <p><a href="${loginLink}" style="background: #1e3a8a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Entry List in Dashboard</a></p>
      </div>
    `;

    for (const team of tournament.teams) {
      for (const player of team.players) {
        sendRawEmail({
          to: player.email,
          subject: `🎾 Entry List Published: ${tournament.name}`,
          html
        }).catch(e => console.error(`Failed to send broadcast to ${player.email}`, e));
        sentCount++;
      }
    }

    return NextResponse.json({ success: true, message: `Successfully broadcasted invites to ${sentCount} players.` });
  } catch (error) {
    console.error('[tournaments/broadcast/POST]', error);
    return NextResponse.json({ error: 'Failed to broadcast invites' }, { status: 500 });
  }
}
