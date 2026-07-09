import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    // Aggregate health metrics
    const activeMatches = await prisma.match.count({
      where: { tournamentId: tournamentId || undefined, status: 'IN_PROGRESS' }
    });

    const activeDisputes = await prisma.incidentReport.count({
      where: { incidentType: 'DISPUTE' }
    });

    const recentAudits = await prisma.auditLog.count({
      where: { 
        tournamentId: tournamentId || undefined,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60) } // Last hour
      }
    });

    return NextResponse.json({ 
      activeMatches,
      activeDisputes,
      interventionsLastHour: recentAudits,
      systemStatus: activeDisputes > 3 ? 'WARNING' : 'HEALTHY'
    });
  } catch (error) {
    console.error('Health API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
