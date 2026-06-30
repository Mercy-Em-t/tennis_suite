import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !['HOST', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, formatType, maxTeams, poolSize, courts } = await request.json();

    const courtsData = courts && Array.isArray(courts) 
      ? courts.map((courtName: string) => ({ name: courtName, courtType: 'TENNIS_HARD' }))
      : [];

    const newTournament = await prisma.tournament.create({
      data: {
        name,
        formatType: formatType || 'Standard',
        maxTeams: parseInt(maxTeams) || 16,
        isActive: false, // Host publishes it manually later
        courts: {
          create: courtsData
        }
      }
    });

    return NextResponse.json({ success: true, tournament: newTournament });
  } catch (error) {
    console.error('[tournaments/POST]', error);
    return NextResponse.json({ error: 'Failed to create tournament' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !['HOST', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const tournaments = await prisma.tournament.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { teams: true, matches: true }
        }
      }
    });

    return NextResponse.json({ success: true, tournaments });
  } catch (error) {
    console.error('[tournaments/GET]', error);
    return NextResponse.json({ error: 'Failed to fetch tournaments' }, { status: 500 });
  }
}
