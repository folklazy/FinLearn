import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session?.user;
    const isAuthPage = AUTH_PAGES.some(p => nextUrl.pathname.startsWith(p));

    if (isLoggedIn && isAuthPage) {
        return NextResponse.redirect(new URL('/', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/login', '/register', '/forgot-password'],
};
