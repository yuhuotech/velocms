import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check all possible NextAuth session cookie names
  const cookies = request.cookies
  const hasSessionCookie = 
    cookies.has('next-auth.session-token') ||
    cookies.has('__Secure-next-auth.session-token') ||
    cookies.has('next-auth.csrf-token') ||
    cookies.has('__Host-next-auth.csrf-token') ||
    cookies.has('next-auth.callback-url')

  const isLoggedIn = hasSessionCookie
  const isOnLogin = pathname === '/login'
  const isAdmin = pathname.startsWith('/admin')

  // If on login page and already logged in, redirect to admin
  if (isOnLogin && isLoggedIn) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/admin'
    return NextResponse.redirect(new URL(callbackUrl, request.url))
  }

  // If accessing admin pages without being logged in, redirect to login
  if (isAdmin && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
