import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  try {
    const { name, email, password, phone, categories, category, franchiseName, tournamentId, skillLevel, playstyle, emergencyContact } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        category,
        passwordHash,
        skillLevel: skillLevel ? parseFloat(skillLevel) : null,
        playstyle: playstyle || null,
        emergencyContact: emergencyContact || null,
        role: 'PLAYER',
      },
    });

    let checkoutUrl: string | null = null;

    if (franchiseName) {
      let targetTournamentId = tournamentId;

      if (!targetTournamentId) {
        const activeTournament = await prisma.tournament.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });
        targetTournamentId = activeTournament?.id;
      }

      if (targetTournamentId) {
        const categoryParam = Array.isArray(categories) && categories.length > 0 
          ? `&c=${encodeURIComponent(JSON.stringify(categories))}` 
          : '';
        checkoutUrl = `/checkout?t=${targetTournamentId}&f=${encodeURIComponent(franchiseName)}${categoryParam}`;
      }
    }

    // Automatically issue session token on successful registration
    const tokenPayload = {
      sub: user.id,
      roles: [user.role],
      context: {
        activeRole: user.role,
        organizationId: null, // Always null on fresh registration
        activeTournamentId: null,
        assignedCourtId: null,
        hasClub: false
      }
    };

    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
      checkoutUrl,
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    logger.info('New user registered', { userId: user.id, role: user.role });
    return response;
  } catch (error) {
    logger.error('[auth/register] Registration failed', {}, error);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
