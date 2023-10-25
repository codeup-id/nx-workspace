import { getToken } from 'next-auth/jwt';
import { authOptionsBase, getLoginUrl } from '@up-code/next-base/init';
import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    cookieName: authOptionsBase.cookies?.sessionToken?.name,
  });
  const pathname = req.nextUrl.pathname;

  if (pathname !== '/') {
    if (!token) {
      const host = req.headers.get('host') ?? req.nextUrl.host;
      const url = req.nextUrl;
      if (host !== url.host) url.host = host;
      return NextResponse.redirect(
        getLoginUrl({
          callbackUrl: url.toString(),
        })
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
