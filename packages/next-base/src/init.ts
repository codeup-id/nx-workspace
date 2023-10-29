import type { NextAuthOptions } from 'next-auth';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const DOMAIN_ROOT = process.env.DOMAIN_ROOT ?? 'codeup.id';

export const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export class InitBaseURL extends URL {
  toPath(path: string) {
    this.pathname = path;
    return this.toString();
  }
}
export type InitBaseURLType = InstanceType<typeof InitBaseURL>;

export function baseUrlParser(baseUrl: string) {
  const url = new InitBaseURL(baseUrl);
  if (IS_PRODUCTION) {
    url.protocol = 'https:';
  } else {
    url.protocol = 'http:';
  }
  return url;
}

export const BASE_URL_WWW = baseUrlParser(
  `http://www.${DOMAIN_ROOT}`
).toString();
export const BASE_URL_BACKEND = baseUrlParser(
  process.env.BASE_URL_BACKEND ?? `http://backend.${DOMAIN_ROOT}`
).toString();

export const BASE_URL_BACKEND_INTERNAL = process.env.BASE_URL_BACKEND_INTERNAL
  ? baseUrlParser(process.env.BASE_URL_BACKEND_INTERNAL).toString()
  : BASE_URL_BACKEND;

export const BASE_URL_AUTH = process.env.BASE_URL_AUTH
  ? baseUrlParser(process.env.BASE_URL_AUTH).toString()
  : BASE_URL_WWW;
export const BASE_URL_AUTH_INTERNAL = process.env.BASE_URL_AUTH_INTERNAL
  ? baseUrlParser(process.env.BASE_URL_AUTH_INTERNAL).toString()
  : BASE_URL_AUTH;

export const AUTH_LOGIN_URL = `${BASE_URL_AUTH}/api/auth/signin`;
export const BACKEND_TOKEN = process.env.BACKEND_TOKEN;

export const authOptionsBase: Pick<
  NextAuthOptions,
  'cookies' | 'secret' | 'pages'
> = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    // signOut: '/auth/logout',
  },
  cookies: {
    sessionToken: {
      name: IS_PRODUCTION
        ? `__Secure-auth.session-token`
        : `auth.session-token`,
      options: {
        domain: `.${DOMAIN_ROOT}`,
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: IS_PRODUCTION ? true : false,
      },
    },
  },
};

export const getLoginUrl = ({ callbackUrl }: { callbackUrl: string }) => {
  if (callbackUrl.startsWith('/') && process.env.NEXT_PUBLIC_BASE_URL) {
    callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${callbackUrl}`;
  }
  const url = new InitBaseURL(AUTH_LOGIN_URL);
  url.search = new URLSearchParams({ callbackUrl }).toString();
  return url.toString();
};

export const getLogoutUrl = ({ callbackUrl }: { callbackUrl: string }) => {
  if (callbackUrl.startsWith('/') && process.env.NEXT_PUBLIC_BASE_URL) {
    callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${callbackUrl}`;
  }
  const url = new InitBaseURL(BASE_URL_AUTH);
  url.pathname = '/api/auth/signout';
  url.search = new URLSearchParams({ callbackUrl }).toString();
  return url.toString();
};

export const getAuthToken = (req: NextRequest) => {
  return getToken({
    req,
    secret: authOptionsBase.secret,
    cookieName: authOptionsBase.cookies?.sessionToken?.name,
    secureCookie: authOptionsBase.cookies?.sessionToken?.options.secure,
  });
};
