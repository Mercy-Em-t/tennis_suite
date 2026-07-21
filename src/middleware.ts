import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Helper to record audit logs via the edge-compatible API route
async function logUnauthorizedAccess(req: NextRequest, role: string, sub: string) {
  try {
    const auditPayload = {
      userId: sub,
      role: role,
      action: 'UNAUTHORIZED_ACCESS',
      resource: req.nextUrl.pathname,
      ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: 'User attempted to access a restricted dashboard without correct role.',
    };

    const baseUrl = req.nextUrl.origin;
    await fetch(`${baseUrl}/api/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditPayload),
    });
  } catch (error) {
    console.warn('[Middleware] Failed to log unauthorized access:', error);
  }
}

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

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = req.nextUrl.pathname || '/';
  url.pathname = pathname;

  // Gate 2 Policy: Enforce /referee
  if (pathname.startsWith('/dashboards/referee')) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = pathname.replace(/^\/dashboards\/referee/, '/referee');
    return NextResponse.redirect(redirectUrl);
  }

  // Exclude API routes, static assets, marketing, login, register, and tournament public profiles
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/' ||
    pathname.startsWith('/tournaments') ||
    pathname.includes('/marketing')
  ) {
    return NextResponse.next();
  }

  // Guard the /app private routes
  if (pathname.startsWith('/app') || pathname.startsWith('/referee') || pathname.startsWith('/dashboards')) {
    const token = req.cookies.get('auth_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl, { status: 303 });
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'invalid_session');
      return NextResponse.redirect(loginUrl, { status: 303 });
    }

    // Determine Role
    let role = 'PLAYER';
    if (payload.context?.activeRole) {
      role = payload.context.activeRole.toLowerCase();
    } else if (payload.roles && payload.roles.length > 0) {
      role = payload.roles[0].toLowerCase();
    }
    
    // RBAC Routing Checks
    let requestedDashboard = '';
    const pathSegments = pathname.split('/');
    if (pathname.startsWith('/app/dashboards/')) {
      requestedDashboard = pathSegments[3]; 
    } else if (pathname.startsWith('/dashboards/')) {
      requestedDashboard = pathSegments[2];
    } else if (pathname.startsWith('/referee')) {
      requestedDashboard = 'referee';
    }

    if (requestedDashboard) {
      let isAllowed = false;

      if (requestedDashboard === 'tournaments') {
        isAllowed = true;
      } else if (role === 'admin') {
        isAllowed = true;
      } else if (role === 'host') {
        if (requestedDashboard === 'host' || requestedDashboard === 'player') isAllowed = true;
      } else if (role === 'player') {
        if (requestedDashboard === 'player' || requestedDashboard === 'host') isAllowed = true;
      } else if (role === 'referee' || role === 'umpire') {
        if (requestedDashboard === 'referee' || requestedDashboard === 'player' || requestedDashboard === 'umpire') isAllowed = true;
      } else if (role === 'marshall') {
        if (requestedDashboard === 'marshall' || requestedDashboard === 'player') isAllowed = true;
      } else if (role === 'director' || role === 'delegate') {
        if (requestedDashboard === 'director' || requestedDashboard === 'player' || requestedDashboard === 'delegate') isAllowed = true;
      } else if (role === 'broadcast' || role === 'broadcaster' || role === 'network') {
        if (requestedDashboard === 'broadcast' || requestedDashboard === 'broadcaster' || requestedDashboard === 'network' || requestedDashboard === 'player') isAllowed = true;
      } else if (role === 'monitor') {
        if (requestedDashboard === 'monitor' || requestedDashboard === 'player') isAllowed = true;
      } else if (role === 'manager') {
        if (requestedDashboard === 'manager') isAllowed = true;
      }

      if (!isAllowed) {
        await logUnauthorizedAccess(req, role, payload.sub);
        // Special redirect for referee due to Gate 2 policy
        let fallbackPath = `/app/dashboards/${role}`;
        if (role === 'referee') {
          fallbackPath = '/referee';
        } else if (role === 'broadcast' || role === 'network') {
          fallbackPath = '/app/dashboards/broadcaster';
        }
        
        const fallbackUrl = new URL(fallbackPath, req.url);
        fallbackUrl.searchParams.set('error', 'forbidden');
        return NextResponse.redirect(fallbackUrl, { status: 303 });
      }
    }
  }

  // 2. Subdomain Routing Logic
  let hostname = req.headers.get('host') || '';
  hostname = normalizeDomain(hostname.split(':')[0]); // normalize port

  const allowedDomains = getAllowedDomains();
  const isAppSubdomain = hostname.startsWith('app.');

  // App Subdomain Routing
  if (isAppSubdomain) {
    if (url.pathname.startsWith('/referee')) {
      url.pathname = `/app/dashboards${url.pathname}`;
    } else if (url.pathname.startsWith('/tournaments')) {
      url.pathname = `/app/dashboards${url.pathname}`;
    } else if (!url.pathname.startsWith('/app')) {
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
};
