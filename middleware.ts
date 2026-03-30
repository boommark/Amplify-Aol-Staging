import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthRoute =
    pathname.startsWith('/auth') || pathname.startsWith('/api/auth')
  const isLoginPage = pathname === '/login'
  const isApiRoute = pathname.startsWith('/api/')

  // Create Supabase client for session refresh
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — keeps auth cookies alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Authenticated user visiting login → redirect to chat
  if (user && isLoginPage) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  // Unauthenticated user on protected route → redirect to login
  if (!user && !isLoginPage && !isAuthRoute && !isApiRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin route guard (AUTH-05)
  if (user && pathname.startsWith('/admin')) {
    const role = user.app_metadata?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }
  }

  supabaseResponse.headers.set('x-pathname', pathname)
  return supabaseResponse
}
