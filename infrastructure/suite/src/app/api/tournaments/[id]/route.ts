import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !['HOST', 'ADMIN', 'MARSHALL'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: params.id },
      include: {
        matches: {
          include: {
            teamA: true,
            teamB: true,
            court: true,
          }
        },
        teams: true,
        courts: true,
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Calculate Completion Ratio and Average Time
    const totalMatches = tournament.matches.length;
    const completedMatches = tournament.matches.filter(m => m.status === 'COMPLETED');
    const completedCount = completedMatches.length;
    const completionPercentage = totalMatches === 0 ? 0 : Math.round((completedCount / totalMatches) * 100);

    const avgDuration = completedCount > 0 
      ? Math.round(completedMatches.reduce((acc, m) => acc + m.durationSec, 0) / completedCount)
      : 0;

    return NextResponse.json({
      success: true,
      tournament,
      stats: {
        totalMatches,
        completedMatches: completedCount,
        completionPercentage,
        avgDurationSec: avgDuration
      }
    });
  } catch (error) {
    console.error('[tournaments/id/GET]', error);
    return NextResponse.json({ error: 'Failed to fetch tournament data' }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
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

    const body = await request.json();

    const updated = await prisma.tournament.update({
      where: { id: params.id },
      data: body
    });

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('[tournaments/id/PATCH]', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}
