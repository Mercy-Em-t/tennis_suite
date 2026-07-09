import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ matchId: string }> }
) {
  try {
    const params = await props.params;
    const { matchId } = params;

    const logs = await prisma.auditLog.findMany({
      where: { matchId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
