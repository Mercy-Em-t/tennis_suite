import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/require-auth';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const { id: userId, role } = authResult;

    const { confirmation } = await request.json();

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation string' }, { status: 400 });
    }

    // Soft delete: Anonymize the user record to preserve relational integrity for matches/tournaments
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: 'Deleted User',
        email: `deleted-${userId}@anonymized.local`,
        phone: null,
        passwordHash: '',
        // Keep role, id, and other relational fields intact
      }
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'ACCOUNT_DELETED',
        details: JSON.stringify({ message: 'User performed a soft-delete of their account.', role, resource: '/api/user/delete' }),
      }
    });

    logger.info(`User ${userId} successfully soft-deleted their account.`);

    // Invalidate the session token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      expires: new Date(0),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error('[api/user/delete] Failed to delete account', {}, error);
    return NextResponse.json({ error: 'Failed to process account deletion' }, { status: 500 });
  }
}
