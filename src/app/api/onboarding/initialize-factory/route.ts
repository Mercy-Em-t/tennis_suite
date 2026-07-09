import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyToken, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return new NextResponse('Unauthorized API Access Call', { status: 401 });

    const session = await verifyToken(token);
    if (!session || session.context.activeRole !== 'HOST') {
      return new NextResponse('Unauthorized: Must be a Host', { status: 401 });
    }

    const { orgName, courtsCount, surfaceType } = await request.json();

    // Atomic Transaction: Block if any single court row entry fails to construct
    const result = await prisma.$transaction(async (tx) => {
      // 1. Instantiate the Organization (Club in the schema)
      const newOrganization = await tx.club.create({
        data: {
          name: orgName,
          subdomain: orgName.toLowerCase().replace(/[^a-z0-9]/g, ''),
        }
      });

      // 2. Instantiate the Tournament Factory attached to this Club
      const newTournament = await tx.tournament.create({
        data: {
          name: `${orgName} Inaugural Open`,
          formatType: 'Standard',
          clubId: newOrganization.id,
          hostId: session.sub,
          maxTeams: 32,
          surfaceType: surfaceType
        }
      });

      // 3. Loop and generate the Court Layout for the Dispatcher Grid
      const courtsBatch = Array.from({ length: courtsCount }).map((_, index) => {
        return tx.court.create({
          data: {
            name: `Court ${index + 1}`,
            courtType: surfaceType === 'HARD' ? 'TENNIS_HARD' : 'TENNIS_CLAY',
            tournamentId: newTournament.id,
            status: 'IDLE' // Default initial status loop state
          }
        });
      });

      await Promise.all(courtsBatch);

      return { organization: newOrganization, tournament: newTournament };
    });

    // 4. Cleanly mutate active context for the JWT token
    const freshlyMintedPayload = {
      ...session,
      context: {
        ...session.context,
        organizationId: result.organization.id,
        activeTournamentId: result.tournament.id,
        hasClub: true
      }
    };

    const newJwtString = await signToken(freshlyMintedPayload);

    // 5. Re-bake cookie context at edge layer securely
    (await cookies()).set('auth_token', newJwtString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });

    return NextResponse.json({ success: true, orgId: result.organization.id, tournamentId: result.tournament.id });
  } catch (error) {
    console.error("Critical Factory Interruption Engine Fault:", error);
    return new NextResponse('Internal Transaction Failure Strategy Active', { status: 500 });
  }
}
