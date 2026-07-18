import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const body = await request.json();
    const { name, email, phone, role } = body;
    const slugOrId = params.id;

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required.' }, { status: 400 });
    }

    const tournament = await prisma.tournament.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }] },
      select: { id: true }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create a shadow account with a random robust password
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + "A1!";
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: 'PLAYER', // Default role for shadow accounts
        },
      });
    }

    // Check if they already applied
    const existingStaff = await prisma.staff.findFirst({
      where: {
        userId: user.id,
        tournamentId: tournament.id,
      }
    });

    if (existingStaff) {
      return NextResponse.json({ error: 'You have already applied or are already on staff for this tournament.' }, { status: 400 });
    }

    const staff = await prisma.staff.create({
      data: {
        name: user.name || user.email,
        role: role,
        userId: user.id,
        tournamentId: tournament.id,
        status: 'PENDING'
      }
    });

    return NextResponse.json({ success: true, staff });
  } catch (error: any) {
    console.error('[public/tournaments/[id]/staff/POST]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
