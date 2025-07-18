import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  
  // 공개 경로 (권한 검증 불필요)
  const publicPaths = ['/', '/login', '/register', '/shop', '/product'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // 보호된 경로 (로그인 필요)
  const protectedPaths = ['/profile', '/cart', '/orders'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // 관리자 경로 (관리자 권한 필요)
  const adminPaths = ['/admin'];
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));
  
  // 1. 보호된 경로 접근 시 토큰 없으면 로그인 페이지로
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
  }
  
  // 2. 관리자 경로 접근 시 토큰 없으면 로그인 페이지로
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login?redirect=' + pathname, request.url));
  }
  
  // 3. 로그인 페이지에서 이미 토큰이 있으면 홈으로
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 