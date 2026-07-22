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

    // Send real email to host
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sports.tmsavannah.com';
    const registerLink = `${origin}/tournaments/${tournament.slug || tournament.id}/register`;
    const staffLink = `${origin}/tournaments/${tournament.slug || tournament.id}/apply-staff`;

    const hostEmail = tournament.contactEmail || tournament.host?.email;
    if (hostEmail) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2e7d32;">🚀 Tournament Launched: ${tournament.name}</h2>
          <p>Congratulations! Your tournament <strong>"${tournament.name}"</strong> is now LIVE.</p>
          <ul>
            <li><strong>Location:</strong> ${tournament.location}</li>
            <li><strong>Dates:</strong> ${tournament.startDate?.toISOString().split('T')[0]} to ${tournament.endDate?.toISOString().split('T')[0]}</li>
            <li><strong>Format:</strong> ${tournament.formatType}</li>
          </ul>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p><strong>Share this Magic Link with players to register:</strong></p>
          <p><a href="${registerLink}" style="background: #2e7d32; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Player Registration</a></p>
          <br />
          <p><strong>Share this link to recruit referees and marshalls:</strong></p>
          <p><a href="${staffLink}" style="color: #2e7d32; text-decoration: none; border-bottom: 1px solid #2e7d32;">Staff Application</a></p>
        </div>
      `;

      sendRawEmail({
        to: hostEmail,
        subject: `🚀 Tournament Launched: ${tournament.name}`,
        html
      }).catch(e => console.error('Failed to send launch email', e));
    }

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('[tournaments/id/launch]', error);
    return NextResponse.json({ error: 'Failed to launch tournament' }, { status: 500 });
  }
}
