import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

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

    const tournament = await prisma.tournament.findFirst({
      where: { OR: [{ slug: params.id }, { id: params.id }] },
      include: { host: true }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    if (tournament.isArchived) {
      return NextResponse.json({ error: 'Cannot launch an archived tournament.' }, { status: 400 });
    }

    if (tournament.isActive) {
      return NextResponse.json({ error: 'Tournament is already launched and active.' }, { status: 400 });
    }

    // Validate mandatory fields
    const missingFields = [];
    if (!tournament.startDate) missingFields.push('Start Date');
    if (!tournament.endDate) missingFields.push('End Date');
    if (!tournament.location) missingFields.push('Location');
    if (!tournament.contactEmail) missingFields.push('Contact Email');

    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Cannot launch. Missing mandatory settings: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Update tournament to active
    const updated = await prisma.tournament.update({
      where: { id: tournament.id },
      data: { isActive: true }
    });

    // Send "Email" to host
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sports.tmsavannah.com';
    const registerLink = `${origin}/tournaments/${tournament.slug || tournament.id}/register`;
    const staffLink = `${origin}/tournaments/${tournament.slug || tournament.id}/staff/apply`;

    console.log('\n======================================================');
    console.log(`✉️ MOCK EMAIL DISPATCHED`);
    console.log(`To: ${tournament.contactEmail || tournament.host?.email}`);
    console.log(`Subject: 🚀 Tournament Launched: ${tournament.name}`);
    console.log('------------------------------------------------------');
    console.log(`Congratulations! Your tournament "${tournament.name}" is now LIVE.`);
    console.log(`Location: ${tournament.location}`);
    console.log(`Dates: ${tournament.startDate?.toISOString().split('T')[0]} to ${tournament.endDate?.toISOString().split('T')[0]}`);
    console.log(`Format: ${tournament.formatType}`);
    console.log('');
    console.log(`Share this Magic Link with players to register:`);
    console.log(registerLink);
    console.log('');
    console.log(`Share this link to recruit referees and marshalls:`);
    console.log(staffLink);
    console.log('======================================================\n');

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('[tournaments/id/launch]', error);
    return NextResponse.json({ error: 'Failed to launch tournament' }, { status: 500 });
  }
}
