/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextAuthOptions, Session, User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

import {
  directusClientAuthenticationJson,
  directusClientBackendRest,
} from './api';
import { readUsers, updateUser } from '@directus/sdk';
import { authOptionsBase } from './init';
import { GetTokenParams, getToken } from 'next-auth/jwt';
import { randomUUID } from 'crypto';

const decodeBackendAccessToken = (accessToken: string) =>
  JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());

const createUserToken = async (userId: string): Promise<User | null> => {
  const token = Buffer.from(`${Date.now()}-${randomUUID()}`).toString(
    'base64url'
  );
  try {
    const user = await directusClientBackendRest().request(
      updateUser(userId, { token }, { fields: ['id', 'email'] })
    );
    return {
      id: user.id,
      email: user.email!,
      token,
    };
  } catch (e) {
    return null;
  }
};

export const authOptions: NextAuthOptions = {
  ...authOptionsBase,
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    redirect({ baseUrl, url }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      return url;
    },
    async jwt({ token, account, user }) {
      if (account && user) {
        token.email = user.email;
        token.user_token = user.token;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub,
        email: token.email,
      };
      session.user_token = token.user_token;
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: 'Credentials',
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials, req) {
        if (credentials) {
          return await directusClientAuthenticationJson()
            .login(credentials.email, credentials.password)
            .then(async (r) => {
              if (r.access_token && r.refresh_token) {
                const decoded_access_token = decodeBackendAccessToken(
                  r.access_token
                );
                return await createUserToken(decoded_access_token.id);
              }
              return null;
            })
            .catch(() => null);
        }
        return null;
      },
    }),
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      // @ts-ignore
      async profile(profile) {
        const { email } = profile;
        if (email) {
          const user = await directusClientBackendRest().request(
            readUsers({ fields: ['id', 'email'], filter: { email } })
          );
          if (user && user[0]) {
            return await createUserToken(user[0].id);
          }
        }
      },
    }),
  ],
};

export const getReqToken = (params: GetTokenParams) => {
  return getToken({
    secret: authOptions.secret,
    cookieName: authOptions.cookies?.sessionToken?.name,
    secureCookie: authOptions.cookies?.sessionToken?.options.secure,
    ...params,
  });
};

export const serverSession = async (): Promise<Session> => {
  const session = await getServerSession({
    cookies: authOptions.cookies,
    callbacks: {
      session: authOptions.callbacks?.session,
    },
  });
  if (!session) {
    throw Error('not authenticated.');
  }
  return session;
};
