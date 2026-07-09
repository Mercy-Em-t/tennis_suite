import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.roles.includes('DIRECTOR')) {
      return NextResponse.json({ error: 'Forbidden: Requires Delegate Authority' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tournamentId = searchParams.get('tournamentId');

    const whereClause = tournamentId ? { tournamentId } : {};

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit to recent 100 for performance on dashboard
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Audit Log Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
