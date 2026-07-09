import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Route map based on Role
const roleDashboardMap: Record<string, string> = {
  HOST: '/dashboards/host',
  ADMIN: '/dashboards/host',
  REFEREE: '/dashboards/referee',
  BROADCASTER: '/dashboards/broadcast',
  PLAYER: '/dashboards/player',
  MARSHALL: '/dashboards/marshal',
  DIRECTOR: '/dashboards/delegate',
  MONITOR: '/monitor'
};

const protectedPrefixes = ['/dashboards/host', '/dashboards/referee', '/dashboards/broadcast', '/dashboards/player', '/dashboards/marshal', '/dashboards/delegate', '/validation', '/monitor', '/tournaments'];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some(prefix => {
    if (pathname.startsWith(prefix)) {
      if (pathname === '/tournaments' || pathname.match(/^\/tournaments\/[^\/]+\/register$/)) {
        return false;
      }
      return true;
    }
    return false;
  });
  
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const token = request.cookies.get('auth_token')?.value;

  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  // If token is invalid but present, clear it effectively by treating it as null for protected routes
  if (isProtected && !payload) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('error', token ? 'invalid_token' : 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // 1. RBAC Logic (Strict Role Enforcement)
  if (isProtected && payload) {
    const role = payload.context.activeRole.toUpperCase();
    
    if (pathname.startsWith('/dashboards/host') && !['HOST', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/dashboards/referee') && !['REFEREE', 'ADMIN', 'UMPIRE'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/dashboards/broadcast') && !['BROADCASTER', 'ADMIN', 'HOST'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/dashboards/player') && !['PLAYER', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/dashboards/marshal') && !['HOST', 'ADMIN', 'MARSHALL', 'PLAYER'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/dashboards/delegate') && !['DIRECTOR', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
    if (pathname.startsWith('/monitor') && !['MONITOR', 'ADMIN', 'HOST'].includes(role)) return NextResponse.redirect(new URL('/app', request.url));
  }

  // 2. Subdomain Routing Logic
  let hostname = request.headers.get('host') || '';
  hostname = hostname.split(':')[0]; // normalize port

  const allowedDomains = ['yourdomain.com', 'localhost'];
  const isAppSubdomain = hostname.startsWith('app.');

  // App Subdomain Routing
  if (isAppSubdomain) {
    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Custom Multi-Tenant Club Domains
  const isBaseDomain = allowedDomains.some(domain => hostname === domain);
  if (!isBaseDomain && !isAppSubdomain) {
    url.pathname = `/clubs/${hostname}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
