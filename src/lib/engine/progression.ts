import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Pillar 36: Gamified Loyalty & Progression System
 * Awards Global XP based on match outcomes and unlocks digital badges.
 */
export async function awardMatchXP(userId: string, isWin: boolean, isTournamentFinal: boolean = false) {
  let xpGained = isWin ? 100 : 25; // 100 for win, 25 for participating
  
  if (isTournamentFinal && isWin) {
    xpGained += 500; // Bonus for winning a tournament
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newXp = user.globalXp + xpGained;
  let badges: string[] = JSON.parse(user.badges || '[]');

  // Badge Unlock Logic
  if (newXp >= 1000 && !badges.includes("Veteran")) {
    badges.push("Veteran");
  }
  if (isTournamentFinal && isWin && !badges.includes("Champion")) {
    badges.push("Champion");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      globalXp: newXp,
      badges: JSON.stringify(badges)
    }
  });

  return { updatedUser, xpGained, badgesUnlocked: badges.length > JSON.parse(user.badges || '[]').length };
}
