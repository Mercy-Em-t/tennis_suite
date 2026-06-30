import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 27: Internal Revenue Splits & Co-op Distribution
 * Pillar 8: Payment & Financial Architecture
 * 
 * Automatically calculates and routes percentages of incoming revenue to Partners and "Rainmakers" (Sales reps).
 */
export async function processRegistrationRevenue(registrationFee: number, rainmakerId: string | null) {
  // Configurable platform take rate
  const platformFeePercentage = 0.10; // 10%
  const rainmakerPercentage = 0.05;   // 5%

  const platformTake = registrationFee * platformFeePercentage;
  let rainmakerCut = 0;

  // 1. If a Rainmaker closed this deal, cut them a commission
  if (rainmakerId) {
    rainmakerCut = registrationFee * rainmakerPercentage;
    
    await prisma.rainmakerFee.create({
      data: {
        brokerName: `Broker_${rainmakerId}`,
        dealAmount: registrationFee,
        feePercent: rainmakerPercentage,
        payoutAmount: rainmakerCut
      }
    });
  }

  // 2. The remaining pool goes to the Tournament Host / Prize Pool
  const netRevenue = registrationFee - platformTake - rainmakerCut;

  return {
    grossRevenue: registrationFee,
    platformTake,
    rainmakerCut,
    netRevenueToHost: netRevenue
  };
}
