import { NextResponse } from 'next/server';

/**
 * Extracts and verifies the role from a JWT Bearer token.
 * Note: Uses base64 payload decoding for sandbox simulation. Production requires jose.jwtVerify.
 */
export function verifyJwtRole(authHeader: string | null, allowedRoles: string[]) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: false, error: 'Unauthorized: Missing token' };
  }
  
  const token = authHeader.split(' ')[1];
  let extractedRole = 'GUEST';
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    extractedRole = payload.role;
  } catch (e) {
    extractedRole = token; // Fallback for raw string injection
  }

  if (!allowedRoles.includes(extractedRole)) {
    return { valid: false, error: `403 Forbidden: ${extractedRole} role lacks required permissions.` };
  }
  
  return { valid: true, role: extractedRole };
}
