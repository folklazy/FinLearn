import { NextRequest, NextResponse } from 'next/server';

const AUTH_ONLY_PAGES = ['/login', '/register', '/forgot-password'];

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Static files & public assets
    if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
        return NextResponse.next();
    }

    // Redirect logged-in users away from auth pages
    const isAuthPage = AUTH_ONLY_PAGES.some(p => pathname.startsWith(p));
    if (isAuthPage) {
        const sessionCookie =
            request.cookies.get('authjs.session-token') ??
            request.cookies.get('__Secure-authjs.session-token');
        if (sessionCookie) {
            return NextResponse.redirect(new URL('/', request.nextUrl));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
