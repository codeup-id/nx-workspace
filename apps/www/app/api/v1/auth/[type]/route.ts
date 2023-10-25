import { getReqToken } from '@up-code/next-base/auth';
import { NextRequest, NextResponse } from 'next/server';

async function handler(
  req: NextRequest,
  { params: { type } }: { params: { type: string } }
) {
  if (type === 'token') {
    const token = await getReqToken({
      req,
    });
    return NextResponse.json(token);
  }
}

export { handler as GET, handler as POST };
