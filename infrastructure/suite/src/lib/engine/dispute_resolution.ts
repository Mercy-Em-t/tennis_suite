import { PrismaClient } from '@prisma/client';
import { TennisScoreState } from './scoring';

const prisma = new PrismaClient();

/**
 * Pillar 11: Edge-Case Match Resolution (The Dispute Engine)
 * Pillar 37: Incident & Emergency Protocol
 */

export async function resolveScoreDispute(matchId: string, hostId: string, overrideScoreState: TennisScoreState, reason: string) {
  // 1. Log the dispute/override into the Audit Log
  await prisma.auditLog.create({
    data: {
      matchId,
      action: "SCORE_CORRECTED",
      details: `Host ${hostId} overrode score. Reason: ${reason}. New Score Sets: ${overrideScoreState.setsA}-${overrideScoreState.setsB}`
    }
  });

  // 2. Override the Match score
  const updatedMatch = await prisma.match.update({
    where: { id: matchId },
    data: {
      scoreState: JSON.stringify(overrideScoreState),
      status: "IN_PROGRESS" // Clears any DISPUTED state
    }
  });

  return updatedMatch;
}

export async function triggerMedicalTimeout(matchId: string, refereeId: string, details: string) {
  // 1. Pause the Match State Machine
  await prisma.match.update({
    where: { id: matchId },
    data: {
      status: "PAUSED",
      pauseReason: "MEDICAL_EMERGENCY"
    }
  });

  // 2. Log Incident for Legal/Liability (Pillar 37)
  const incident = await prisma.incidentReport.create({
    data: {
      matchId,
      reportedBy: refereeId,
      incidentType: "MEDICAL",
      description: details
    }
  });

  return incident;
}
