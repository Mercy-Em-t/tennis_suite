import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/require-auth';
import { logger } from '@/lib/logger';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await requireAuth(['HOST', 'ADMIN']);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Fetch ALL committed pools for the whole draw
    const allCommittedPools = await prisma.pool.findMany({
      where: { tournamentId: id, status: 'COMMITTED' },
      include: {
        poolTeams: {
          orderBy: { seed: 'asc' },
          include: { team: true }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });

    if (allCommittedPools.length === 0) {
      return NextResponse.json({ error: 'No committed pools found to dispatch.' }, { status: 400 });
    }

    // Group by category for the email
    const categoriesMap = new Map<string, any[]>();
    allCommittedPools.forEach(pool => {
      if (!categoriesMap.has(pool.category)) categoriesMap.set(pool.category, []);
      categoriesMap.get(pool.category)!.push(pool);
    });

    let wholeDrawHtml = '';
    categoriesMap.forEach((poolsInCat, catName) => {
      wholeDrawHtml += `<div style="margin-bottom: 24px; border: 1px solid #eaeaea; padding: 16px; border-radius: 8px;">`;
      wholeDrawHtml += `<h2 style="color: #22d3ee; margin-top: 0; border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Category: ${catName}</h2>`;
      
      poolsInCat.forEach(pool => {
        const teamsHtml = pool.poolTeams.map((pt: any) => `
          <li style="padding: 4px 0; border-bottom: 1px solid #f5f5f5;">
            <strong style="color: #666;">Seed ${pt.seed}</strong>: ${pt.team.franchiseName}
          </li>
        `).join('');
        
        wholeDrawHtml += `
          <div style="margin-top: 16px;">
            <h3 style="margin-bottom: 8px; font-size: 1.1rem; color: #333;">${pool.name}</h3>
            <ul style="list-style-type: none; padding-left: 0; margin: 0; border: 1px solid #f5f5f5; border-radius: 4px; padding: 8px;">
              ${teamsHtml}
            </ul>
          </div>
        `;
      });
      
      wholeDrawHtml += `</div>`;
    });

    const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://sports.tmsavannah.com'}/tournaments/${tournament.slug || id}`;

    await sendEmail({
      to: 'participants@example.com', // To be wired by user
      subject: `Official Draw Published: ${tournament.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="text-align: center;">The Official Draw is Ready!</h1>
          <p style="font-size: 1.1rem; text-align: center; margin-bottom: 32px;">
            The pools have been finalized. Please review the official draw below.
          </p>
          
          ${wholeDrawHtml}
          
          <div style="text-align: center; margin-top: 40px;">
            <a href="${publicUrl}" style="display: inline-block; padding: 12px 24px; background: #22d3ee; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 1.1rem;">
              View Full Draw Online
            </a>
          </div>
        </div>
      `
    });

    logger.info('Unified whole draw email dispatched', { tournamentId: id });
    return NextResponse.json({ success: true, message: 'Unified emails dispatched successfully.' });
  } catch (error: any) {
    logger.error('[pools/dispatch-emails/POST] Failed', {}, error);
    return NextResponse.json({ error: error.message || 'Dispatch failed' }, { status: 500 });
  }
}
