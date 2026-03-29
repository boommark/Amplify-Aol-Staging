import { type NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth routes and public assets through
  const isAuthRoute =
    pathname.startsWith('/auth') || pathname.startsWith('/api/auth')
  const isLoginPage = pathname === '/login'
  const isApiRoute = pathname.startsWith('/api/')

  // Check for Supabase auth cookie (sb-<project-ref>-auth-token)
  const hasAuthCookie = request.cookies.getAll().some(
    (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  // If user has auth cookie and visits login, redirect to chat
  if (hasAuthCookie && isLoginPage) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // If no auth cookie and trying to access a protected route, redirect to login
  if (!hasAuthCookie && !isLoginPage && !isAuthRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Set x-pathname header so Server Component layouts can read current path
  const response = NextResponse.next()
  response.headers.set('x-pathname', pathname)
  return response
}
