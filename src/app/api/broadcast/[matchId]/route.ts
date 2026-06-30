import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface LiveTelemetry {
  matchStatus: string;
  durationSec: number;
  currentServer: string | null;
  score: {
    teamA: number;
    teamB: number;
  }
}

export interface VisualAssets {
  teamA: { name: string; logoUrl: string | null };
  teamB: { name: string; logoUrl: string | null };
}

export interface BroadcastPayload {
  telemetry: LiveTelemetry;
  assets: VisualAssets;
}

export async function GET(request: Request, context: { params: Promise<{ matchId: string }> }) {
  const params = await context.params;
  const matchId = params.matchId;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { teamA: true, teamB: true }
  });

  if (!match) {
    return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  }

  let parsedScore = { gamesA: 0, gamesB: 0 };
  try {
    const s = JSON.parse(match.scoreState);
    parsedScore.gamesA = s.gamesA || 0;
    parsedScore.gamesB = s.gamesB || 0;
  } catch (e) {}

  const payload: BroadcastPayload = {
    telemetry: {
      matchStatus: match.status,
      durationSec: match.durationSec,
      currentServer: match.currentServer,
      score: {
        teamA: parsedScore.gamesA,
        teamB: parsedScore.gamesB
      }
    },
    assets: {
      teamA: {
        name: match.teamA?.franchiseName || 'TBD',
        logoUrl: match.teamA?.logoUrl || null
      },
      teamB: {
        name: match.teamB?.franchiseName || 'TBD',
        logoUrl: match.teamB?.logoUrl || null
      }
    }
  };

  return NextResponse.json(payload)
}
