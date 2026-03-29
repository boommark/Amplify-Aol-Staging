import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export const maxDuration = 300

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Allow auth routes and public assets through
  const isAuthRoute = pathname.startsWith('/auth') || pathname.startsWith('/api/auth')
  const isLoginPage = pathname === '/login'

  // If user is authenticated and visits login, redirect to chat
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // If no user and trying to access a protected route, redirect to login
  if (!user && !isLoginPage && !isAuthRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin route guard (AUTH-05): Only admin role can access /admin/*
  if (pathname.startsWith('/admin')) {
    const role = user?.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/chat?error=unauthorized', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
