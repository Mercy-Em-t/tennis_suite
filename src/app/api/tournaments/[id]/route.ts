import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateUniqueSlug } from '@/lib/slug';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.some(r => ['HOST', 'ADMIN', 'MARSHALL'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Accept either a slug (e.g. "summer-open-2026") or a raw cuid
    const slugOrId = params.id;
    const tournament = await prisma.tournament.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId },
        ],
      },
      include: {
        matches: {
          include: {
            teamA: true,
            teamB: true,
            court: true,
          }
        },
        teams: true,
        courts: {
          include: { referee: true, marshall: true }
        },
        staff: {
          include: { user: true }
        },
        pools: {
          include: { poolTeams: { include: { team: true } } }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Calculate completion ratio and average match duration
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
    if (!payload || !payload.roles.some(r => ['HOST', 'ADMIN'].includes(r))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Resolve tournament by slug or cuid
    const existing = await prisma.tournament.findFirst({
      where: { OR: [{ slug: params.id }, { id: params.id }] },
      select: { id: true, name: true, slug: true, lifecyclePhase: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Freeze mutations if archived (unless an ADMIN is explicitly unlocking it)
    if (existing.lifecyclePhase === 'ARCHIVED' && body.lifecyclePhase !== 'POST_TOURNAMENT') {
      return NextResponse.json({ error: 'This tournament is archived and read-only.' }, { status: 403 });
    }

    // If the name is changing, regenerate the slug
    let slugUpdate: { slug?: string } = {};
    if (body.name && body.name !== existing.name) {
      slugUpdate.slug = await generateUniqueSlug(body.name, existing.id);
    }

    const updated = await prisma.tournament.update({
      where: { id: existing.id },
      data: { ...body, ...slugUpdate }
    });

    return NextResponse.json({ success: true, tournament: updated });
  } catch (error) {
    console.error('[tournaments/id/PATCH]', error);
    return NextResponse.json({ error: 'Failed to update tournament' }, { status: 500 });
  }
}
