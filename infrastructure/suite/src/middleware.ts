import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Route map based on Role
const roleDashboardMap: Record<string, string> = {
  HOST: '/admin',
  ADMIN: '/admin',
  REFEREE: '/referee',
  BROADCASTER: '/broadcast',
  PLAYER: '/team',
  MARSHALL: '/tournaments'
};

const protectedPrefixes = ['/admin', '/referee', '/broadcast', '/team', '/tournaments', '/validation'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix));
  const isAuthPage = pathname === '/login' || pathname === '/register';

  const token = request.cookies.get('auth_token')?.value;

  // 1. If accessing protected route
  if (isProtected) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'invalid_token');
      return NextResponse.redirect(url);
    }

    const role = payload.role.toUpperCase();
    
    // Strict Role Enforcement
    if (pathname.startsWith('/admin') && !['HOST', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardMap[role] || '/', request.url));
    }
    if (pathname.startsWith('/referee') && !['REFEREE', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardMap[role] || '/', request.url));
    }
    if (pathname.startsWith('/broadcast') && !['BROADCASTER', 'ADMIN', 'HOST'].includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardMap[role] || '/', request.url));
    }
    if (pathname.startsWith('/team') && !['PLAYER', 'ADMIN'].includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardMap[role] || '/', request.url));
    }
    if (pathname.startsWith('/tournaments') && !['HOST', 'ADMIN', 'MARSHALL'].includes(role)) {
      return NextResponse.redirect(new URL(roleDashboardMap[role] || '/', request.url));
    }
  }

  // 2. Gateway / Auth Page Redirect Logic (if already logged in)
  if (pathname === '/' || isAuthPage) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const role = payload.role.toUpperCase();
        const targetPath = roleDashboardMap[role] || '/tournaments';
        // Only redirect from '/' if we don't want the storefront to be shown to logged-in users.
        // Actually, for the storefront, we might want logged in users to see it, but the requirement is:
        // "Upon login, the system must decode the JWT role and automatically redirect the user to their walled garden"
        // Let's redirect from /login and /register always. From '/', only redirect if it's the exact auth flow.
        if (isAuthPage) {
          const url = request.nextUrl.clone();
          url.pathname = targetPath;
          return NextResponse.redirect(url);
        }
      }
    }
  }

  // Pillar 14: White-Label Subdomain Routing
  const hostname = request.headers.get('host') || '';
  const isSubdomain = hostname.includes('.') && !hostname.startsWith('localhost') && !hostname.startsWith('www.');
  
  if (isSubdomain) {
    const subdomain = hostname.split('.')[0];
    const url = request.nextUrl.clone();
    url.pathname = `/_tenant/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

