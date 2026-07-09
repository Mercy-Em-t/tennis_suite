import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export interface AuthPayload {
  id: string;
  role: string;
}

/**
 * Reusable server-side authentication guard for API Route Handlers.
 *
 * Usage (inside any route.ts):
 *   const authResult = await requireAuth(['HOST', 'ADMIN']);
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { id: userId, role } = authResult;
 *
 * @param allowedRoles - Optional whitelist of roles (uppercase). If omitted, any authenticated
 *   user is permitted. If provided, a valid token with a non-matching role returns 403.
 * @returns AuthPayload on success, or a NextResponse (401/403) on failure.
 */
export async function requireAuth(
  allowedRoles?: string[]
): Promise<AuthPayload | NextResponse> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized: No session token found.' },
      { status: 401 }
    );
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or expired session.' },
      { status: 401 }
    );
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = (payload.roles[0] || 'PLAYER').toUpperCase();
    if (!allowedRoles.map(r => r.toUpperCase()).includes(role)) {
      return NextResponse.json(
        {
          error: `Forbidden: Role '${role}' does not have permission to access this resource.`,
        },
        { status: 403 }
      );
    }
  }

  return { id: payload.sub, role: (payload.roles[0] || 'PLAYER').toUpperCase() };
}




export interface TournamentAuthPayload extends AuthPayload {
  staffRole?: string; // If they are accessing via a staff role instead of global role
}

/**
 * Reusable server-side authentication guard for Tournament-specific resources.
 * Allows access if the user is a global HOST/ADMIN, OR if they are an approved
 * staff member for the tournament with one of the allowed roles.
 */
export async function requireTournamentAccess(
  tournamentId: string,
  allowedStaffRoles: string[] = ['REFEREE']
): Promise<TournamentAuthPayload | NextResponse> {
  // 1. Basic Auth check (allow any logged-in user initially to inspect their identity)
  const baseAuth = await requireAuth();
  if (baseAuth instanceof NextResponse) return baseAuth;
  
  const user = baseAuth as AuthPayload;
  
  // 2. Global Role Fast-Path
  if (user.role === 'HOST' || user.role === 'ADMIN') {
    return { ...user };
  }

  // 3. Tournament Staff Check
  const staffRecord = await prisma.staff.findFirst({
    where: {
      userId: user.id,
      tournamentId,
      status: 'APPROVED',
      role: { in: allowedStaffRoles }
    }
  });

  if (staffRecord) {
    return { ...user, staffRole: staffRecord.role };
  }

  // 4. Deny Access
  return NextResponse.json(
    { error: 'Forbidden: You do not have permission to access this tournament.' },
    { status: 403 }
  );
}
