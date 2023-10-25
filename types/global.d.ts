import NodeJS from 'node';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;

      DOMAIN_ROOT: string;

      AUTH_GOOGLE_CLIENT_ID: string;
      AUTH_GOOGLE_CLIENT_SECRET: string;

      BACKEND_TOKEN: string;
      BASE_URL_AUTH: string;
      BASE_URL_AUTH_INTERNAL: string;
      BASE_URL_BACKEND: string;
      BASE_URL_BACKEND_INTERNAL: string;

      NEXTAUTH_URL: string;
      NEXTAUTH_URL_INTERNAL: string;
      NEXTAUTH_SECRET: string;
    }
  }
}
