import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';




export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, service } = body;

    const lead = await prisma.lead.create({
      data: { email, name, service }
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to capture lead' }, { status: 400 });
  }
}
