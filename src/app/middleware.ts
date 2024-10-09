import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const origin = req.headers.get('origin');

  // You can allow only specific origins here
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  if (origin && origin !== allowedOrigin) {
    return new NextResponse('Not allowed by CORS', { status: 403 });
  }

  const response = NextResponse.next();

  // Set CORS headers
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return response;
}

// Config to apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
};
