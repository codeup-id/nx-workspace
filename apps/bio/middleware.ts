import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getLoginUrl } from '@up-code/next-base/init';

export default async function middleware(req: NextRequest) {
  const token = await getAuthToken(req);
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
