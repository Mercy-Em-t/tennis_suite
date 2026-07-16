import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_me_in_production';

export async function POST(request: Request) {
  try {
    const { name, email, phone, categories, franchiseName, tournamentId } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
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
          role: 'PLAYER',
        },
      });
    }

    // Sign a token to log them in for the checkout session
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      sub: user.id,
      email: user.email,
      roles: [user.role],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
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

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      checkoutUrl
    });

  } catch (error) {
    console.error('[guest-register]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
