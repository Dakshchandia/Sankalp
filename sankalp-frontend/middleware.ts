import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedPrefixes = ['/supervisor', '/worker'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedPrefixes.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get('sankalp_token')?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/supervisor/:path*', '/worker/:path*'],
};
