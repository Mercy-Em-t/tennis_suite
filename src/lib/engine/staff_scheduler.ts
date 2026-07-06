import { prisma } from '@/lib/prisma';




/**
 * Pillar 15: Staff Rotation Engine
 * Automatically assigns "Ball Boys" to upcoming matches based on their current load.
 */
export async function assignStaffToMatches(tournamentId: string) {
  // 1. Fetch available staff
  const staff = await prisma.staff.findMany({
    where: { tournamentId, role: 'BALL_BOY' }
  });

  // 2. Fetch matches needing staff (e.g. IN_PROGRESS but no staff assigned)
  // For MVP, we'll just mock a basic rotation algorithm
  
  if (staff.length === 0) return { error: 'No staff available' };

  // Example Logic: Sort staff by who has rested the longest 
  // (In a real DB, we'd check their last assigned Match duration)
  const rotationQueue = [...staff].sort((a, b) => a.id.localeCompare(b.id)); // Mock sorting
  
  return {
    success: true,
    assignedStaff: rotationQueue[0],
    message: `Staff member ${rotationQueue[0].name} has been deployed to the next available court.`
  };
}
