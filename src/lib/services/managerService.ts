import { prisma } from '@/lib/prisma';

export async function getGlobalMetrics() {
  const [totalUsers, players, hosts, referees, marshalls, broadcasters] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PLAYER' } }),
    prisma.user.count({ where: { role: 'HOST' } }),
    prisma.user.count({ where: { role: 'REFEREE' } }),
    prisma.user.count({ where: { role: 'MARSHALL' } }),
    prisma.user.count({ where: { role: 'BROADCAST' } }) // Assuming BROADCAST or BROADCASTER
  ]);

  return {
    totalUsers,
    byRole: {
      players,
      hosts,
      referees,
      marshalls,
      broadcasters
    }
  };
}

export async function getTournaments() {
  return await prisma.tournament.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { teams: true, matches: true }
      },
      host: { select: { name: true, email: true } }
    }
  });
}

export async function getFinancialOverview() {
  // Real implementation would aggregate ledger entries
  const fees = await prisma.rainmakerFee.aggregate({
    _sum: { payoutAmount: true }
  });
  
  const partnerPayouts = await prisma.partnerPayout.aggregate({
    _sum: { amountOwed: true }
  });
  
  const ledgers = await prisma.ledgerEntry.aggregate({
    _sum: { grossAmount: true, hostPayout: true }
  });

  return {
    platformRevenue: fees._sum.payoutAmount || 0,
    owedToPartners: partnerPayouts._sum.amountOwed || 0,
    grossVolume: ledgers._sum.grossAmount || 0,
    hostPayouts: ledgers._sum.hostPayout || 0,
  };
}
