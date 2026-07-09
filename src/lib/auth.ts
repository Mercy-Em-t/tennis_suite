import { SignJWT, jwtVerify } from 'jose';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-super-secret-key-for-development'
);

export interface TennisSuiteToken {
  sub: string;
  roles: string[];
  context: {
    activeRole: string;
    organizationId: string | null;
    activeTournamentId: string | null;
    assignedCourtId: string | null;
    hasClub?: boolean;
  };
}

export async function signToken(payload: TennisSuiteToken) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<TennisSuiteToken | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TennisSuiteToken;
  } catch (_error) {
    return null;
  }
}
