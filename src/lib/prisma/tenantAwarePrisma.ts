import { prisma } from '../prisma';

export function getTenantPrisma(tournamentId: string) {
  if (!tournamentId) {
    throw new Error('tournamentId is required for tenant isolation');
  }

  // Create an extension that automatically injects tournamentId into where clauses
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const modelsRequiringTenantId = [
            'Team', 'Pool', 'Match', 'Court', 'Staff', 'AuditLog', 
            'PreOrder', 'PlayerStat', 'FanPrediction', 'RainmakerFee', 
            'PartnerPayout', 'LedgerEntry', 'SponsorROI', 'Equipment', 
            'BallCan', 'FreeAgent', 'IncidentReport', 'PoolTeam'
          ];

          if (modelsRequiringTenantId.includes(model)) {
            if (['findUnique', 'findFirst', 'findMany', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
              if (!args) {
                args = { where: {} } as any;
              } else if (!(args as any).where) {
                (args as any).where = {};
              }
              // Enforce tournamentId
              (args as any).where.tournamentId = tournamentId;
            } else if (['create', 'createMany'].includes(operation)) {
              if (operation === 'create') {
                  if (!(args as any).data) (args as any).data = {};
                  (args as any).data.tournamentId = tournamentId;
              } else if (operation === 'createMany') {
                  if (Array.isArray((args as any).data)) {
                      (args as any).data = (args as any).data.map((item: any) => ({ ...item, tournamentId }));
                  }
              }
            }
          }
          return query(args);
        },
      },
    },
  });
}
