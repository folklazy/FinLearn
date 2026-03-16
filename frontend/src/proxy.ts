import { NextRequest, NextResponse } from 'next/server';

const AUTH_ONLY_PAGES = ['/login', '/register', '/forgot-password', '/reset-password'];

const PROTECTED_ROUTES = ['/settings', '/onboarding'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Static files & public assets
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const sessionCookie =
        request.cookies.get('authjs.session-token') ??
        request.cookies.get('__Secure-authjs.session-token');
    const isLoggedIn = !!sessionCookie;

    // Protect private routes — redirect unauthenticated users to /login
    const isProtected = PROTECTED_ROUTES.some(p => pathname.startsWith(p));
    if (isProtected && !isLoggedIn) {
        const loginUrl = new URL('/login', request.nextUrl);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Redirect logged-in users away from auth pages
    const isAuthPage = AUTH_ONLY_PAGES.some(p => pathname.startsWith(p));
    if (isAuthPage && isLoggedIn) {
        return NextResponse.redirect(new URL('/', request.nextUrl));
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|api/).*)'],
};
