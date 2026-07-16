import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Route map based on Role
const roleDashboardMap: Record<string, string> = {
  HOST: '/dashboards/host',
  ADMIN: '/dashboards/host',
  REFEREE: '/referee',
  BROADCASTER: '/dashboards/broadcast',
  PLAYER: '/dashboards/player',
  MARSHALL: '/dashboards/marshal',
  DIRECTOR: '/dashboards/delegate',
  MONITOR: '/monitor'
};

const protectedPrefixes = ['/dashboards/host', '/dashboards/referee', '/referee', '/dashboards/broadcast', '/dashboards/player', '/dashboards/marshal', '/dashboards/delegate', '/validation', '/monitor', '/tournaments'];

const defaultBaseDomains = ['localhost', 'sports.tmsavannah.com', 'tennis-suite.vercel.app'];

function normalizeDomain(domain: string) {
  return domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '');
}

function getAllowedDomains() {
  const configuredDomains = process.env.ALLOWED_BASE_DOMAINS
    ?.split(',')
    .map((domain) => normalizeDomain(domain))
    .filter(Boolean);

  return Array.from(new Set([...(configuredDomains ?? []), ...defaultBaseDomains.map(normalizeDomain)]));
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = request.nextUrl.pathname || '/';
  url.pathname = pathname;

  // Gate 2 Policy: Enforce /referee
  if (pathname.startsWith('/dashboards/referee')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/dashboards\/referee/, '/referee');
    return NextResponse.redirect(redirectUrl);
  }

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
    
    if (pathname.startsWith('/dashboards/host') && !['HOST', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/referee') && !['REFEREE', 'ADMIN', 'UMPIRE'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/dashboards/broadcast') && !['BROADCASTER', 'ADMIN', 'HOST'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/dashboards/player') && !['PLAYER', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/dashboards/marshal') && !['HOST', 'ADMIN', 'MARSHALL', 'PLAYER'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/dashboards/delegate') && !['DIRECTOR', 'ADMIN'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
    if (pathname.startsWith('/monitor') && !['MONITOR', 'ADMIN', 'HOST'].includes(role)) return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Subdomain Routing Logic
  let hostname = request.headers.get('host') || '';
  hostname = normalizeDomain(hostname.split(':')[0]); // normalize port

  const allowedDomains = getAllowedDomains();
  const isAppSubdomain = hostname.startsWith('app.');

  // App Subdomain Routing
  if (isAppSubdomain) {
    // Enforce Gate 2 physical mapping
    if (url.pathname.startsWith('/referee')) {
      url.pathname = `/app/dashboards${url.pathname}`;
    } else if (url.pathname.startsWith('/tournaments')) {
      url.pathname = `/app/dashboards${url.pathname}`;
    } else {
      url.pathname = `/app${url.pathname}`;
    }
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
