import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    const token = request.cookies.get('__session')?.value;

    // Skip static files and public API routes
    if (
      pathname.startsWith('/_next') ||
      pathname === '/favicon.ico' ||
      pathname.startsWith('/api/health') ||
      pathname.startsWith('/api/check-data') ||
      pathname.startsWith('/api/test-firebase')
    ) {
      return NextResponse.next();
    }

    // Root "/" is the login page (public)
    if (pathname === '/' || pathname === '/test-auth') {
      // If already logged in, redirect to dashboard
      if (token) {
        const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard';
        return NextResponse.redirect(new URL(redirectTo, request.url));
      }
      return NextResponse.next();
    }

    // All other routes require authentication
    if (!token) {
      const url = new URL('/', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    // Fallback: allow request (client-side protection will handle it)
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
