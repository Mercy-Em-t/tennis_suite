import { prisma } from '@/lib/prisma';
import MarshalClient from './MarshalClient';
import { notFound } from 'next/navigation';

export default async function MarshalPage({ params }: { params: Promise<{ tournamentId: string }> }) {
  const { tournamentId } = await params;
  
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId }
  });

  if (!tournament) notFound();

  const courts = await prisma.court.findMany({
    where: { tournamentId },
    include: {
      matches: {
        where: {
          status: { in: ['IN_PROGRESS', 'WARMUP', 'READY'] }
        },
        include: {
          teamA: true,
          teamB: true
        }
      }
    }
  });

  const scheduledMatches = await prisma.match.findMany({
    where: {
      tournamentId,
      status: 'SCHEDULED'
    },
    include: {
      teamA: true,
      teamB: true
    }
  });

  return (
    <MarshalClient 
      tournamentId={tournamentId} 
      courts={courts} 
      scheduledMatches={scheduledMatches} 
    />
  );
}
