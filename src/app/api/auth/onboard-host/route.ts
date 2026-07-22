import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

import { signToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';
import { sendTemplateEmail } from '@/lib/mail/dispatch';



export async function POST(request: Request) {
  try {
    const { name, email, password, organizationName } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    // Create the host user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'HOST',
      },
    });

    // Automatically issue session token on successful registration
    const token = await signToken({
      sub: user.id,
      roles: [user.role],
      context: {
        activeRole: user.role,
        organizationId: null,
        activeTournamentId: null,
        assignedCourtId: null,
        hasClub: false
      }
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role, organizationName },
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

    logger.info('New HOST registered', { userId: user.id, organizationName });

    // Send welcome email asynchronously
    sendTemplateEmail({
      to: user.email,
      template: 'welcome_email',
      variables: {
        name: user.name,
        brand_name: 'Tennis Suite',
        message: `Your host account for ${organizationName} has been successfully created. Welcome to the platform!`,
        cta_url: 'https://sports.tmsavannah.com/login',
        cta_label: 'Go to Dashboard'
      }
    }).catch(e => logger.error('Failed to send welcome email', {}, e));

    return response;
  } catch (error) {
    logger.error('[auth/onboard-host] Registration failed', {}, error);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
