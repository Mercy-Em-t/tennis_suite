import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const body = await request.json();
    const { poolTeamId, teamId, sourcePoolId, targetPoolId, targetPoolTeamIds } = body;

    let emailNotificationData: any = null;

    await prisma.$transaction(async (tx) => {
      // 1. Move from Unassigned to Pool
      if (!sourcePoolId && targetPoolId) {
        const pool = await tx.pool.findUnique({ 
          where: { id: targetPoolId },
          include: { poolTeams: { include: { team: true } } }
        });
        // Remove restriction for COMMITTED so we can append late registrants
        // if (pool?.isPublished || pool?.status === 'LOCKED') throw new Error("Cannot modify published pool");

        const newPt = await tx.poolTeam.create({
          data: {
            poolId: targetPoolId,
            teamId: teamId,
            seed: 999, // placeholder
            isLateAssign: true // manually dragged from unassigned
          }
        });
        
        // Update target pool seeds if targetPoolTeamIds provided
        if (targetPoolTeamIds && Array.isArray(targetPoolTeamIds)) {
          // Replace teamId with newPt.id in the array
          const updatedIds = targetPoolTeamIds.map((tid: string) => tid === teamId ? newPt.id : tid);
          for (let i = 0; i < updatedIds.length; i++) {
            await tx.poolTeam.update({
              where: { id: updatedIds[i] },
              data: { seed: i + 1 }
            });
          }
        }

        if (pool?.status === 'COMMITTED') {
          // Identify the team being added to include their name in the email
          const addedTeam = await tx.team.findUnique({ where: { id: teamId } });
          emailNotificationData = {
            poolName: pool.name,
            addedTeamName: addedTeam?.franchiseName || 'A new participant',
            existingTeams: pool.poolTeams.map(pt => pt.team.franchiseName)
          };
        }
      }
      // 2. Move from Pool to Unassigned
      else if (sourcePoolId && !targetPoolId) {
        // Allow removing late assignees from COMMITTED pools (we enforced this on the frontend)
        await tx.poolTeam.delete({
          where: { id: poolTeamId }
        });
      }
      // 3. Move from Pool to Pool
      else if (sourcePoolId && targetPoolId && sourcePoolId !== targetPoolId) {
        // Moving a late assignee between COMMITTED pools
        const p1 = await tx.pool.findUnique({ where: { id: sourcePoolId } });
        const p2 = await tx.pool.findUnique({ 
          where: { id: targetPoolId },
          include: { poolTeams: { include: { team: true } } }
        });

        await tx.poolTeam.update({
          where: { id: poolTeamId },
          data: { poolId: targetPoolId }
        });

        if (targetPoolTeamIds && Array.isArray(targetPoolTeamIds)) {
          for (let i = 0; i < targetPoolTeamIds.length; i++) {
            await tx.poolTeam.update({
              where: { id: targetPoolTeamIds[i] },
              data: { seed: i + 1 }
            });
          }
        }

        if (p2?.status === 'COMMITTED') {
          const addedTeam = await tx.team.findUnique({ where: { id: teamId } });
          emailNotificationData = {
            poolName: p2.name,
            addedTeamName: addedTeam?.franchiseName || 'A new participant',
            existingTeams: p2.poolTeams.map(pt => pt.team.franchiseName)
          };
        }
      }
    });

    if (emailNotificationData) {
      const { sendEmail } = await import('@/lib/email');
      await sendEmail({
        to: 'participants@example.com', // Wire to actual participant emails later
        subject: `Update: New Player Added to ${emailNotificationData.poolName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #22d3ee;">Pool Roster Update</h2>
            <p><strong>${emailNotificationData.addedTeamName}</strong> has just been appended to <strong>${emailNotificationData.poolName}</strong> as a late registration!</p>
            <p>The revised pool roster is now:</p>
            <ul>
              ${emailNotificationData.existingTeams.map((name: string) => `<li>${name}</li>`).join('')}
              <li><strong>${emailNotificationData.addedTeamName} (LATE)</strong></li>
            </ul>
            <p>Match schedules will be updated shortly.</p>
          </div>
        `
      });
      logger.info('Late registration email sent to pool participants', { poolName: emailNotificationData.poolName });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[pools/move/PATCH] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Move failed' }, { status: 500 });
  }
}
