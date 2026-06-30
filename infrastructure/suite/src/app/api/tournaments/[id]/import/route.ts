import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const payload = await verifyToken(token);
    if (!payload || !['HOST', 'ADMIN'].includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { rows } = await request.json(); // Expected format: [{ TeamName, Player1_Name, Player1_Email, Player2_Name, Player2_Email }]

    if (!rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Execute within a transaction for safety
    await prisma.$transaction(async (tx) => {
      let rowIndex = 1;
      for (const row of rows) {
        // Strict Validation
        if (!row.TeamName || !row.Player1_Email || !row.Player2_Email) {
          throw new Error(`Line ${rowIndex}: Missing required fields (TeamName, or Emails).`);
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.Player1_Email)) {
          throw new Error(`Line ${rowIndex}: Invalid email format for Player 1 (${row.Player1_Email}).`);
        }
        if (!emailRegex.test(row.Player2_Email)) {
          throw new Error(`Line ${rowIndex}: Invalid email format for Player 2 (${row.Player2_Email}).`);
        }

        // Upsert Player 1
        const p1 = await tx.user.upsert({
          where: { email: row.Player1_Email },
          update: {},
          create: { name: row.Player1_Name || 'Unknown', email: row.Player1_Email, role: 'PLAYER' }
        });

        // Upsert Player 2
        const p2 = await tx.user.upsert({
          where: { email: row.Player2_Email },
          update: {},
          create: { name: row.Player2_Name || 'Unknown', email: row.Player2_Email, role: 'PLAYER' }
        });

        // Create Team linked to Tournament and Players
        await tx.team.create({
          data: {
            franchiseName: row.TeamName,
            tournamentId: params.id,
            players: { connect: [{ id: p1.id }, { id: p2.id }] }
          }
        });
        
        rowIndex++;
      }
    });

    return NextResponse.json({ success: true, message: `Successfully imported ${rows.length} teams.` });
  } catch (error: any) {
    console.error('[tournaments/import/POST]', error);
    // Return the specific line error if thrown from our transaction validation
    if (error.message.startsWith('Line ')) {
       return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to import bulk data due to database constraint.' }, { status: 500 });
  }
}
