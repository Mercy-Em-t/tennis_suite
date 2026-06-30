import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const freeAgents = await prisma.freeAgent.findMany({
      where: { status: 'AVAILABLE' },
      include: { user: true },
      take: 10
    });

    return NextResponse.json({ success: true, agents: freeAgents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Free Agents' }, { status: 500 });
  }
}
