import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { signToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';



export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return a generic message to avoid leaking whether the email exists
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Reject legacy dev-seed rows that were created without a password
    if (!user.passwordHash) {
      logger.warn('Login attempt on account with no password hash', { email });
      return NextResponse.json(
        { error: 'Account requires password setup. Contact an administrator.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const token = await signToken({ id: user.id, role: user.role });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
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

    logger.info('User logged in', { userId: user.id, role: user.role });
    return response;
  } catch (error: any) {
    logger.error('[auth/login] Login failed', {}, error);
    
    // "Handle them kindly": Provide a gentle message for database timeouts/connection issues
    if (error?.name === 'PrismaClientInitializationError' || error?.message?.includes('Can\'t reach database server')) {
      return NextResponse.json(
        { error: 'Our database is currently taking a quick breather. Please try logging in again in a few moments.' }, 
        { status: 503 }
      );
    }

    return NextResponse.json({ error: 'An unexpected error occurred during login. Please try again.' }, { status: 500 });
  }
}
