import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { injectErrors } = await request.json().catch(() => ({ injectErrors: false }));

    const tournament = await prisma.tournament.create({
      data: {
        name: 'Compliance Archive 2026',
        formatType: 'Standard',
        isActive: false, // finalized
        maxTeams: 8
      }
    });

    const team1 = await prisma.team.create({
      data: { name: 'Audit Team 1', franchiseName: 'Audit Franchise 1', tournamentId: tournament.id, paymentStatus: 'PAID' }
    });

    const team2 = await prisma.team.create({
      data: { name: 'Audit Team 2', franchiseName: 'Audit Franchise 2', tournamentId: tournament.id, paymentStatus: 'PAID' }
    });

    // Valid Ledger Entry (Gross: 5000, Platform: 500, Host: 4500) -> 500+4500 = 5000
    await prisma.ledgerEntry.create({
      data: {
        tournamentId: tournament.id,
        teamId: team1.id,
        grossAmount: 5000,
        platformFee: 500,
        hostPayout: 4500,
      }
    });

    // Second Ledger Entry
    if (injectErrors) {
      // Injected cent mismatch (Gross: 5000, Platform: 500, Host: 4499) -> 500+4499 = 4999 != 5000
      await prisma.ledgerEntry.create({
        data: {
          tournamentId: tournament.id,
          teamId: team2.id,
          grossAmount: 5000,
          platformFee: 500,
          hostPayout: 4499,
        }
      });
      
      // Inject orphaned record for Isolation Scan
      const orphanTourney = await prisma.tournament.create({
        data: { name: 'Orphan Ghost Tournament', formatType: 'Standard' }
      });
      await prisma.match.create({
        data: {
          tournamentId: orphanTourney.id,
          stage: 'POOL',
          status: 'COMPLETED'
        }
      });
      // Delete the tournament without deleting the match, leaving the match orphaned
      // (Prisma relation constraints usually prevent this unless on cascade delete, but let's simulate a broken FK by creating a match with a non-existent UUID if we bypassed prisma, or we just leave the tournament but it has no settings or owner)
      // Actually Prisma foreign keys are strict. Let's just create a Match that belongs to a different tournament but a Team belonging to `tournament.id`.
      await prisma.match.create({
        data: {
          tournamentId: orphanTourney.id,
          stage: 'POOL',
          status: 'COMPLETED',
          teamAId: team1.id // cross-tenant leak! Team from Tourney A playing in Tourney B.
        }
      });

    } else {
      // Valid second ledger
      await prisma.ledgerEntry.create({
        data: {
          tournamentId: tournament.id,
          teamId: team2.id,
          grossAmount: 5000,
          platformFee: 500,
          hostPayout: 4500,
        }
      });
      
      // Valid Match
      await prisma.match.create({
        data: {
          tournamentId: tournament.id,
          stage: 'POOL',
          status: 'COMPLETED',
          teamAId: team1.id,
          teamBId: team2.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: injectErrors ? 'Sandbox created with CRITICAL FAULTS.' : 'Sandbox created with pristine data.',
      tournamentId: tournament.id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
