import { type NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith('/auth') || pathname.startsWith('/api/auth')
  const isLoginPage = pathname === '/login'
  const isApiRoute = pathname.startsWith('/api/')

  // Check for Supabase auth cookies
  const hasAuthCookie = request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    )

  if (hasAuthCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  if (!hasAuthCookie && !isLoginPage && !isAuthRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}
