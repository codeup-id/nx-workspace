import NextAuth from 'next-auth';
import { authOptions } from '@up-code/next-base/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
