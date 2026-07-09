import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return new NextResponse('Unauthorized Session Signature', { status: 401 });

    const currentSession = await verifyToken(token);
    if (!currentSession) return new NextResponse('Invalid Session Signature', { status: 401 });

    const { targetRole } = await request.json(); // e.g., "UMPIRE"

    // 1. Assert Legal Boundary: Verify user actually holds this alternate role permission
    const staffProfile = await prisma.staff.findFirst({
      where: {
        userId: currentSession.sub,
        role: targetRole,
        tournamentId: currentSession.context.activeTournamentId || undefined,
      }
    });

    if (!staffProfile && targetRole !== 'PLAYER') {
      return new NextResponse('Access Violation: Role claims denied at data layer', { status: 403 });
    }

    // 2. Clone core token DNA and cleanly mutate active context
    const freshlyMintedPayload = {
      ...currentSession,
      context: {
        ...currentSession.context,
        activeRole: targetRole,
        assignedCourtId: null // We don't track courtId on staff directly, assuming null unless passed in
      }
    };

    const newJwtString = await signToken(freshlyMintedPayload);

    // 3. Re-bake cookie context at edge layer
    cookies().set('auth_token', newJwtString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return NextResponse.json({ success: true, activeRole: targetRole });
  } catch (error) {
    console.error(error);
    return new NextResponse('Internal Token Exchange Interruption Fault', { status: 500 });
  }
}
