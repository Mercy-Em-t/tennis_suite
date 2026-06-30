import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { signToken } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password, franchiseName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // MVP: No real password hashing, just simulating registration
    
    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    // Create User (default PLAYER)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: 'PLAYER',
      }
    });

    // If franchiseName provided, create Team linked to the active tournament
    if (franchiseName) {
      const activeTournament = await prisma.tournament.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });

      if (activeTournament) {
        await prisma.team.create({
          data: {
            franchiseName,
            tournamentId: activeTournament.id,
            players: {
              connect: { id: user.id }
            }
          }
        });
      }
    }

    // Automatically log them in
    const token = await signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('[auth/register]', error);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
