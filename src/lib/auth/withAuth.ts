import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export function withAuth(
  handler: (
    req: NextRequest,
  ) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return async (req: NextRequest) => {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    
    return handler(req);
  };
}
