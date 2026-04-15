// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// All admin dashboard routes require authentication
const protectedRoutes = [
  '/movies',
  '/showtimes',
  '/rooms',
  '/bookings',
  '/users',
  '/statistics',
];

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const url = request.nextUrl.clone();

  const isProtected = protectedRoutes.some((route) =>
    url.pathname.startsWith(route)
  );

  if (isProtected && !accessToken) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/movies/:path*',
    '/showtimes/:path*',
    '/rooms/:path*',
    '/bookings/:path*',
    '/users/:path*',
    '/statistics/:path*',
  ],
};
