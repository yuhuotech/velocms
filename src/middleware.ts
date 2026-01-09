import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only session tokens indicate a logged-in state
  const cookies = request.cookies
  const hasSessionCookie = 
    cookies.has('next-auth.session-token') ||
    cookies.has('__Secure-next-auth.session-token') ||
    cookies.has('authjs.session-token') ||
    cookies.has('__Secure-authjs.session-token')

  const isLoggedIn = hasSessionCookie
  const isOnLogin = pathname === '/login'
  const isAdmin = pathname.startsWith('/admin')

  // 💡 Debug: Add cookies names to a header so we can see what's happening in the network tab
  const response = (isOnLogin && isLoggedIn)
    ? NextResponse.redirect(new URL(request.nextUrl.searchParams.get('callbackUrl') || '/admin', request.url))
    : (isAdmin && !isLoggedIn)
      ? NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url))
      : NextResponse.next()

  response.headers.set('X-Debug-LoggedIn', String(isLoggedIn))
  response.headers.set('X-Debug-Path', pathname)
  response.headers.set('X-Debug-Cookie-Names', cookies.getAll().map(c => c.name).join(', '))
  
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
