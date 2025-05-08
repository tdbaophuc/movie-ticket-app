// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Những route cần bảo vệ
const protectedRoutes = ['/movies', '/dashboard', '/users']; // Thêm route khác nếu cần

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
  matcher: ['/movies', '/dashboard', '/users'], 
};
