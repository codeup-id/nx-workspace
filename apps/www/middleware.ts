import { authOptionsBase } from '@up-code/next-base/init';
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth(
  (req) => {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    if (pathname === '/auth/login') {
      if (token) {
        const callbackUrl =
          req.nextUrl.searchParams.get('callbackUrl') ?? new URL('/', req.url);
        return NextResponse.redirect(callbackUrl);
      }
      return NextResponse.next();
    }
  },
  {
    // pages: authOptionsBase.pages,
    cookies: authOptionsBase.cookies,
    callbacks: {
      authorized({ req, token }) {
        if (req.nextUrl.pathname === '/auth/login') {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
