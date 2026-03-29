import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const maxDuration = 300

export async function middleware(request: NextRequest) {
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

  // Refresh session — this is the critical call that keeps cookies alive
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Allow auth routes and public assets through
  const isAuthRoute =
    pathname.startsWith('/auth') || pathname.startsWith('/api/auth')
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
      return NextResponse.redirect(
        new URL('/chat?error=unauthorized', request.url)
      )
    }
  }

  // Set x-pathname header so Server Component layouts can read current path
  supabaseResponse.headers.set('x-pathname', pathname)

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
