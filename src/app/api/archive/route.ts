import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { tournamentId, championId } = await request.json();

    // Mark the tournament as archived and set the champion
    const tournament = await prisma.tournament.update({
      where: { id: tournamentId },
      data: { 
        isActive: false, 
        isArchived: true,
        championId: championId 
      }
    });

    // Mock generating a Wrap-Up Summary for the Newsletter
    const wrapUpSummary = `The tournament ${tournament.name} has concluded! The champion has been crowned.`;

    return NextResponse.json({ 
      success: true, 
      tournament,
      wrapUpSummary
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to archive tournament' }, { status: 400 });
  }
}
